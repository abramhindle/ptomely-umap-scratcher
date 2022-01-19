import argparse, umap, os, hdbscan
import numpy
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.cluster import AgglomerativeClustering
from utils import read_json, write_json, check_make
import csv


this_script = os.path.dirname(os.path.realpath(__file__))

parser = argparse.ArgumentParser(description='Reduce the data from an analysis file')
parser.add_argument('-i', '--infile', type=str, help='The input folder to analyse')
parser.add_argument('-o', '--outfile', type=str, default='reduce.json', help='The output json')
parser.add_argument('-n', '--neighbours', type=int, default='7', help='Number of neighbours for UMAP.')
parser.add_argument('-m', '--mindist', type=float, default='0.1', help='Minimum distance for neighbourhood for UMAP')
parser.add_argument('-c', '--components', type=int, default='3', help='Number of components to reduce to')
parser.add_argument('-a', '--algorithm', type=str, default='hdbscan', help='algorithm for clustering. options are agglom(erative) or hdbscan.')
parser.add_argument('--sample',type=int, default=100000, help='Maximum elements to fit on before transformation')
parser.add_argument('-d', '--depth', type=int, default=250, help='number of clusters to look for (if agglomerative)')

args = parser.parse_args()

# feature = read_json(args.infile)
def read_db(csvfile):
    db = {"filenames":None,"mat":None}
    rows = []
    filenames = []
    with open(csvfile) as fd:
        reader = csv.reader(fd)
        for row in reader:
            filename = row[0]
            rest = [int(x) for x in row[1:]]
            index = rest[0]
            vals = rest[1:]
            filenames.append((filename,index))
            rows.append(vals)
    db["mat"] = numpy.array(rows)
    # print(csvfile,db["mat"].shape)
    db["filenames"] = filenames
    return db

feature = read_db( args.infile )

print("Loading DB")
# raw_data = [v for v in feature.values()]
raw_data = feature["mat"]
# keys = [k for k in feature.keys()]
keys = [str(x) for x in  feature["filenames"]]

scaler = StandardScaler()
unstandardised_data = np.array(raw_data)
data = scaler.fit_transform(unstandardised_data)

print("Create Reduction")
# Create class for computing UMAP
reduction = umap.UMAP(
    n_components=args.components, 
    n_neighbors=args.neighbours, 
    min_dist=args.mindist
)

# Execute fit and transform
print("Execute fit and transform")

if unstandardised_data.shape[0] > args.sample:
    print(f"Sampling {args.sample}")
    row_indices = np.random.choice(unstandardised_data.shape[0], size=args.sample, replace=False)
    print(f"Fitting {args.sample}")
    reduction = reduction.fit( unstandardised_data[row_indices,:] )
    print(f'Transforming {unstandardised_data.shape[0]}')
    data = reduction.transform( unstandardised_data )
else:
    data = reduciton.fit_transform(unstandardised_data)

# data = reduction.fit_transform(data)



# Normalisation for sane coordinates
print("Normalisation for sane coordinates")
post_normalisation = MinMaxScaler()
normalised_data = post_normalisation.fit_transform(data)

########## CLUSTERING ##########
print("CLUSTERING")
if args.algorithm == 'hdbscan':
    db = hdbscan.HDBSCAN().fit(normalised_data)
if args.algorithm == 'agglom':
    db = AgglomerativeClustering(n_clusters=args.depth).fit(data)

### D3.JS ###

print("D3.JS Clusters")
num_clusters = 0
for _, cluster in zip(keys, db.labels_):
    if cluster > num_clusters:
        num_clusters = cluster

# Pack the keys and data into a dictionary
d3_coordinates = {}
d3_inner_list = []

print("Key to cluster")
key_to_cluster = {}
for audio, cluster in zip(keys, db.labels_):
    key_to_cluster[audio] = int(cluster)

print("KV")
for key, value in zip(keys, normalised_data):
    # print(key)
    t_dict = {}
    coords = value.tolist()
    t_dict["name"] = key
    t_dict["x"] = coords[0]
    t_dict["y"] = coords[1]
    t_dict["z"] = coords[2]
    #for audio, cluster in zip(keys, db.labels_):
    #    if audio == key:
    #        t_dict["cluster"] = int(cluster)
    if key in key_to_cluster:
            t_dict["cluster"] = key_to_cluster[key]
    d3_inner_list.append(t_dict)

d3_coordinates["data"] = d3_inner_list
d3_coordinates["meta"] = [int(num_clusters)]

# Write it out
print('Write it out')
json_dir = os.path.join(this_script, '_reduction')
json_path = os.path.join(json_dir, args.outfile)
write_json(json_path, d3_coordinates)
