from pangolin.server_application.scene import Scene
from pangolin.server_application.app_object import AppObject
import random
import json


class QuantitySolver(AppObject):
    def __init__(self):
        super().__init__()
        self.data = None

    def set_quantity_scheme(self,index):
        print(f'set quantity scheme[{index}] for planner')

    def gen_data(self):
        self.data = []
        site_area = 50000  # 模擬一個5萬方的場地
        for i in range(100):
            entry = dict()
            entry['_x'] = i  # 這個序列號是用來做排序動畫的
            entry['far_t'] = random.random() * 6 + 3  # 模擬一個3-9的容積率
            entry['far_a'] = entry['far_t'] * (1.1 - random.random() * 0.2)  # 模擬幅度上下10 % 的偏差
            entry['far_d'] = entry['far_a'] - entry['far_t']
            entry['gfa_t'] = entry['far_t'] * site_area
            entry['gfa_a'] = entry['far_a'] * site_area
            entry['gfa_d'] = entry['far_d'] * site_area
            entry['coverage_t'] = random.random() * 0.3 + 0.3  # 模擬一個30 % - 60 % 的覆蓋率
            entry['coverage_a'] = entry['coverage_t'] * (1.1 - random.random() * 0.2)  # 模擬幅度上下10 % 的偏差
            entry['coverage_d'] = entry['coverage_a'] - entry['coverage_t']
            entry['ca_t'] = entry['coverage_t'] * site_area
            entry['ca_a'] = entry['coverage_a'] * site_area
            entry['ca_d'] = entry['coverage_d'] * site_area
            entry['score'] = 1 - ((abs(entry['gfa_d']) / entry['gfa_t'] + abs(entry['ca_d']) / entry['ca_t']) / 2)
            t1c = 1 + round(random.random() * 13)
            t2c = 1 + round(random.random() * 13)
            t3c = 1 + round(random.random() * 13)
            entry['t1'] = '█' * t1c + ' ' + str(t1c)
            entry['t2'] = '█' * t2c + ' ' + str(t2c)
            entry['t3'] = '█' * t3c + ' ' + str(t3c)
            entry['t1_a'] = t1c * 1100
            entry['t2_a'] = t2c * 1200
            entry['t3_a'] = t3c * 1400
            entry['sales'] = (entry['t1_a'] * 3) + (entry['t2_a'] * 2.4) + (entry['t3_a'] * 4)
            self.data.append(entry)

    def send_data(self):
        if self.data is None or len(self.data )< 1:
            self.gen_data()
        msg = dict()
        msg['cmd'] = 'set_planning_quantity_data'
        msg['data'] = self.data
        self.scene.message_queue.append(msg)

    def _update(self):
        self.send_data()


class Scene(Scene):
    def setup(self):
        # this name will be used by the html client
        self.quantity_solver = QuantitySolver()
        self.add(self.quantity_solver)

