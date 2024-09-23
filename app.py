from flask import Flask, jsonify, request, send_from_directory, render_template, url_for
import json
import webbrowser
import os

host = "127.0.0.1"  # localhost: 127.0.0.1  private: 192.168.*.*
port = 5050

data_file = 'data.json'


app = Flask(__name__, static_folder='static', template_folder='templates')

# start page in browser
webbrowser.open(f'http://{host}:{port}')

if not os.path.exists(data_file):
    # make data.json with default data
    with open(data_file, 'w') as f:
        json.dump({}, f)


@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')


# read data.json
@app.route('/api/data', methods=['GET'])
def get_data():
    with open(data_file, 'r') as f:
        data = json.load(f)
    return jsonify(data)


# write data.json
@app.route('/api/data', methods=['POST'])
def save_data():
    new_data = request.json
    with open(data_file, 'w') as f:
        json.dump(new_data, f, indent=4)
    return jsonify({"status": "success"})


# for prettier urls (ie .html at end not needed)
@app.route('/<path:path>')
def serve_static_files(path):
    file = path.split("/")[-1]
    if "." not in file:
        return send_from_directory(app.static_folder, f"{path}.html")
    else:
        return send_from_directory(app.static_folder, path)


@app.route('/template/<id>')
def template_page(id):
    return render_template("template.html", id=id)


if __name__ == '__main__':
    app.run(host=host, port=port)
