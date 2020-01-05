import argparse, os, sys, tempfile
import multiprocessing as mp
import subprocess as sp
import numpy as np
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from scipy import stats
from utils import write_json, bufread, check_make

this_script = os.path.dirname(os.path.realpath(__file__))
bin_path = os.path.join(this_script, "bin")
fluid_mfcc = os.path.join(bin_path, "fluid-mfcc")
fluid_stats = os.path.join(bin_path, "fluid-stats")

parser = argparse.ArgumentParser(description='Analyse a folder for MFCCs and flatten to stats')
parser.add_argument('-i', '--infolder', type=str, help='The input folder to analyse')
parser.add_argument('-o', '--outfile', type=str, help='The output json')
parser.add_argument('-n', '--numbands', type=str, default='40', help='Number of bands for MFCC to compute.')
args = parser.parse_args()

extensions = [
    ".wav",
    ".aif",
    ".aiff"
]

data = mp.Manager().dict()

audio_files = os.listdir(args.infolder)
audio_files = [f for f in audio_files if os.path.splitext(f)[1] in extensions]
num_files = len(audio_files)

# Analyse

def mfcc(idx):
    file = audio_files[idx]
    full_path = os.path.join(args.infolder, audio_files[idx])
    
    # MFCC analysis
    temp_mfcc = f'{tempfile.mkstemp()[1]}-mfcc.wav'
    sp.call([
        fluid_mfcc,
        '-source', full_path,
        '-features', temp_mfcc,
        '-maxnumcoeffs', '13',
        '-numcoeffs', '13',
        '-numbands', '40'
    ])

    # STATS analysis
    temp_stats = f'{tempfile.mkstemp()[1]}-stats.wav'
    sp.call([
        fluid_stats,
        '-source', temp_mfcc,
        '-stats', temp_stats,
        '-numderivs', '3'
    ])

    stats = bufread(temp_stats)
    
    # FLATTEN data and store in the dictionary
    try:
        data[file] = stats.flatten().tolist()
        os.remove(temp_mfcc)
        os.remove(temp_stats)
    except:
        print(f'There was no data to process for {file}.')

    # Cleanup


with mp.Pool() as pool:
    for i in pool.imap_unordered(mfcc, range(num_files)):
        pass

data = dict(data)

json_dir = os.path.join(this_script, '_analysis')
check_make(json_dir)
json_path = os.path.join(json_dir, 'anal.json')
write_json(json_path, data)