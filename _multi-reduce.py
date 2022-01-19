import argparse, umap, os, hdbscan
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.cluster import AgglomerativeClustering
from utils import read_json, write_json, check_make

this_script = os.path.dirname(os.path.realpath(__file__))

parser = argparse.ArgumentParser(description='Reduce the data from an analysis file')
parser.add_argument('-i', '--infile', type=str, help='The input folder to analyse')
parser.add_argument('-o', '--outfile', type=str, default='reduce.json', help='The output json')
parser.add_argument('-n', '--neighbours', type=int, default='7', help='Number of neighbours for UMAP.')
parser.add_argument('-m', '--mindist', type=float, default='0.1', help='Minimum distance for neighbourhood for UMAP')

args = parser.parse_args()

feature = read_json(args.infile)

raw_data = [v for v in feature.values()]
keys = [k for k in feature.keys()]

scaler = StandardScaler()
unstandardised_data = np.array(raw_data)
if unstandardised_data.shape[0] > 10000:
    print("Sampling 10k")
    row_indices = np.random.choice(unstandardised_data.shape[0], size=10000, replace=False)
    scaler = scaler.fit( unstandardised_data[row_indices,:] )
    data = scaler.transform( unstandardised_data )
else:
    data = scaler.fit_transform(unstandardised_data)

# Create class for computing UMAP
reduction = umap.UMAP(
    n_components=3, 
    n_neighbors=args.neighbours, 
    min_dist=args.mindist
)

# Execute fit and transform
data = reduction.fit_transform(data)

# Normalisation for sane coordinates
post_normalisation = MinMaxScaler()
normalised_data = post_normalisation.fit_transform(data)



### D3.JS ###
cluster_depths = [125, 250, 500, 1600, 3200]

master_dict = {}
internal_array = []

for depth in cluster_depths:
    ########## CLUSTERING ##########
    db = AgglomerativeClustering(n_clusters=depth).fit(data)
    # Pack the keys and data into a dictionary
    d3_coordinates = {}
    d3_inner_list = []

    # Find Number of Clusters
    num_clusters = 0
    for _, cluster in zip(keys, db.labels_):
        if cluster > num_clusters:
            num_clusters = cluster

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
    internal_array.append(d3_coordinates)

master_dict["reductions"] = internal_array

# Write it out
json_dir = os.path.join(this_script, '_reduction')
json_path = os.path.join(json_dir, args.outfile)
write_json(json_path, master_dict)
