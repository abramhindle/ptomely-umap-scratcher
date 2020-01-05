import os
import rapidjson as json
import soundfile as sf

def check_make(folder_check):
    if not os.path.isdir(folder_check):
        os.mkdir(folder_check)

def write_json(json_file, in_dict):
    path = os.path.dirname(json_file)
    check_make(path)
    with open(json_file, "w+") as fp:
        json.dump(in_dict, fp, indent=4)


def read_json(json_file):
    with open(json_file, "r") as fp:
        data = json.load(fp)
        return data

def bufread(audio_file):
    try:
        t_data, _ = sf.read(audio_file)
        return t_data.transpose()
    except:
        print(f'Could not read: {audio_file}')