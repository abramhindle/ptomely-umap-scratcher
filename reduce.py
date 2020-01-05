import argparse, umap, os, hdbscan
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from utils import read_json, write_json, check_make

this_script = os.path.dirname(os.path.realpath(__file__))

parser = argparse.ArgumentParser(description='Reduce the data from an analysis file')
parser.add_argument('-i', '--infile', type=str, help='The input folder to analyse')
parser.add_argument('-o', '--outfile', type=str, help='The output json')
parser.add_argument('-n', '--neighbours', type=int, default='7', help='Number of neighbours for UMAP.')
parser.add_argument('-m', '--mindist', type=float, default='0.1', help='Minimum distance for neighbourhood for UMAP')
parser.add_argument('-c', '--components', type=int, default='3', help='Number of components to reduce to')

args = parser.parse_args()

feature = read_json(args.infile)

raw_data = [v for v in feature.values()]
keys = [k for k in feature.keys()]

scaler = StandardScaler()
unstandardised_data = np.array(raw_data)
data = scaler.fit_transform(unstandardised_data)

# Create class for computing UMAP
reduction = umap.UMAP(
    n_components=args.components, 
    n_neighbors=args.neighbours, 
    min_dist=args.mindist
)

# Execute fit and transform
data = reduction.fit_transform(data)

# Normalisation for sane coordinates
post_normalisation = MinMaxScaler()
normalised_data = post_normalisation.fit_transform(data)

########## CLUSTERING ##########
db = hdbscan.HDBSCAN().fit(normalised_data)

### D3.JS ###

num_clusters = 0
for _, cluster in zip(keys, db.labels_):
    if cluster > num_clusters:
        num_clusters = cluster

# Pack the keys and data into a dictionary
d3_coordinates = {}
d3_inner_list = []

for key, value in zip(keys, normalised_data):
    t_dict = {}
    coords = value.tolist()
    t_dict["name"] = key
    t_dict["x"] = coords[0]
    t_dict["y"] = coords[1]
    t_dict["z"] = coords[2]
    for audio, cluster in zip(keys, db.labels_):
        if audio == key:
            t_dict["cluster"] = int(cluster)
    d3_inner_list.append(t_dict)

d3_coordinates["data"] = d3_inner_list
d3_coordinates["meta"] = [int(num_clusters)]

# Write it out
json_dir = os.path.join(this_script, '_reduction')
json_path = os.path.join(json_dir, 'd3_reduce.json')
write_json(json_path, d3_coordinates)