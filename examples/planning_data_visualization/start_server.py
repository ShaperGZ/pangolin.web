from pangolin.server_application.scene import Scene
import importlib
from pangolin.core import GraphNode
from flask import Flask, request, render_template
from flask_socketio import SocketIO
import json
import linecache
import sys
import importlib
import threading

main_thread=None
scene = None
# TODO: serve all webpages from the server
# template_dir = 'D:\\PangolinProjects\\pangolin.web'
# app = Flask('my simple server', template_folder=template_dir, static_url_path=template_dir)
app = Flask('my simple server')
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
loaded_scene = None


# @app.route("/viewer")
# def get_viewer():
#     headers = {'Content-Type': 'text/html'}
#     return render_template('app.html',200,headers)


@socketio.on('message')
def handle_message(m):
    socketio.send('I got your message')
    try:
        eval(m)
    except Exception as e:
        # print(e)

        _printException()
        print('message being eval was:', m)


def _printException():
    exc_type, exc_obj, tb = sys.exc_info()
    f = tb.tb_frame
    lineno = tb.tb_lineno
    filename = f.f_code.co_filename
    linecache.checkcache(filename)
    line = linecache.getline(filename, lineno, f.f_globals)
    print('EXCEPTION IN ({}, LINE {} "{}"): {}'.format(filename, lineno, line.strip(), exc_obj))

def exit():
    global scene
    if scene is not None:
        scene.close()
    socketio.stop()


def load_scene(app_dir):
    global scene
    global loaded_scene

    if scene is not None:
        scene.close()

    print('loading scene:',app_dir)
    try:
        mod = importlib.reload(sys.modules[app_dir])
        print('reloaded:', app_dir)
    except Exception as e:
        print(e)
        mod = importlib.import_module(app_dir)
        print('imported:', app_dir)

    loaded_scene = app_dir
    print('loaded scene =', loaded_scene)
    scene = mod.Scene()
    scene.socketio = socketio
    scene.module_name = loaded_scene
    scene.setup()
    scene.start()
    scene.load_scene()
    return scene

def reload_scene(app_dir=None):
    print('realoding:', app_dir)
    global scene
    global loaded_scene
    if app_dir is None:
        if loaded_scene is not None:
            print('closing', loaded_scene)
            scene.close()
            app_dir = loaded_scene
            loaded_scene(app_dir)
    else:
        scene.close()
        load_scene(app_dir)
    return scene

def run(app_dir):
    load_scene(app_dir)
    socketio.run(app, port=scene.port)

def main():
    if len(sys.argv)>1:
        app_dir = sys.argv[1]
        run(app_dir)




if __name__ == '__main__':
    main()
