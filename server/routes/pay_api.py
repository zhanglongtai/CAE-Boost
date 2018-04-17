from flask import (
    Blueprint,
    request,
    jsonify,
    Response,
)
import time
import random
import hashlib
import hmac
import xml.etree.ElementTree as ET
import requests
import logging
import os

import config
from models.pay_record import PayRecord

logger = logging.getLogger()
logger.setLevel(logging.INFO)

log_filenam = os.path.dirname(os.getcwd()) + '/server/logs/test.log'
log_file = logging.FileHandler(log_filenam, mode='w')
log_file.setLevel(logging.INFO)

formatter = logging.Formatter("%(asctime)s - %(filename)s[line:%(lineno)d] - %(levelname)s: %(message)s")
log_file.setFormatter(formatter)

logger.addHandler(log_file)

pay_api = Blueprint('pay_api', __name__)


def generate_order_id():
    order_id = time.strftime("%Y%m%d%H%M%S", time.gmtime())
    return order_id


def generate_random_string(length):
    table = 'abcdefghijklmnopqrstuvwxyz'
    table += table.upper()

    random_str = ''
    for i in range(length):
        random_str += random.choice(table)

    return random_str


def generate_wxpay_order():
    appid = config.wxpay['appid']
    mch_id = config.wxpay['mch_id']
    out_trade_no = generate_order_id()

    body = 'wx_pay_test'
    total_fee = 1
    trade_type = 'NATIVE'
    product_id = 1

    notify_url = config.wxpay['notify_url']
    nonce_str = generate_random_string(32)

    wxpay_order = {
        'appid': appid,
        'mch_id': mch_id,
        'out_trade_no': out_trade_no,
        'body': body,
        'total_fee': str(total_fee),
        'trade_type': trade_type,
        'product_id': str(product_id),
        'notify_url': notify_url,
        'nonce_str': nonce_str,
    }

    return wxpay_order


def generate_wxpay_sign(trade_dict, trade_key, hash_type='md5'):
    def generate_string_sign_temp(data, key):
        key_list = list(data.keys())
        key_list.sort()

        string_sign = ''
        for k in key_list:
            string_sign += '{}={}&'.format(k, data[k])

        string_sign += '{}={}'.format('key', key)

        return string_sign

    def generate_md5_sign(sign):
        new_sign = hashlib.md5()
        new_sign.update(sign.encode('utf-8'))

        s = new_sign.hexdigest().upper()
        return s

    def generate_hmac_sha256_sign(sign, key):
        new_sign = hmac.new(key.encode('utf-8'), sign.encode('utf-8'), digestmod=hashlib.sha256)
        s = new_sign.hexdigest().upper

        return s

    string_sign_temp = generate_string_sign_temp(trade_dict, trade_key)

    if hash_type == 'md5':
        md5_sign = generate_md5_sign(string_sign_temp)
        return md5_sign
    elif hash_type == 'hmac-sha256':
        hmac_sha256_sign = generate_hmac_sha256_sign(string_sign_temp, trade_dict['key'])
        return hmac_sha256_sign


def generate_wxpay_sign_xml(trade_dict):
    root = ET.Element('xml')

    key_list = list(trade_dict.keys())

    for k in key_list:
        sub = ET.SubElement(root, k)
        sub.text = trade_dict[k]

    s = ET.tostring(root, encoding="utf-8", method="xml", short_empty_elements=True)
    s = s.decode()
    return s


def wx_unified_order_data(unified_order_api, trade_dict, trade_key):
    sign = generate_wxpay_sign(trade_dict, trade_key, 'md5')
    trade_dict['sign'] = sign

    trade_xml = generate_wxpay_sign_xml(trade_dict)

    r = requests.post(unified_order_api, trade_xml)
    r.encoding = 'utf-8'

    xml_string = r.text
    return parse_xml_string(xml_string)


def parse_xml_string(string):
    root = ET.fromstring(string)

    data = {}
    for child in root:
        data[child.tag] = child.text

    return data


@pay_api.route('/wxpay_url', methods=['POST'])
def wxpay_url():
    # request_data = request.data
    # request_data = json.loads(request_data)
    request_data = request.get_json()
    print(request_data['amount'])

    unifiedorder = config.wxpay['unifiedorder']
    order = generate_wxpay_order()
    key = config.wxpay['key']

    new_pay_record = PayRecord.new(order['out_trade_no'])

    data = wx_unified_order_data(unifiedorder, order, key)

    if data['return_code'] == 'FAIL':
        new_pay_record.save()

        return Response(status=500)
    else:
        new_pay_record.save()

        r = {
            'qr-code': data['code_url'],
            'trade-id': order['out_trade_no'],
        }

        return jsonify(r)


@pay_api.route('/wxpay_notification', methods=['POST'])
def wxpay_notification():
    request_data = request.data

    xml_string = request_data.decode()
    result = parse_xml_string(xml_string)

    def compare_sign(trade_data):
        result_sign = trade_data['sign']

        del trade_data['sign']

        key = config.wxpay['key']

        sign = generate_wxpay_sign(result, key, 'md5')

        if result_sign == sign:
            return True
        else:
            return False

    if compare_sign(result) is True:
        pay_id = result['out_trade_no']
        p = PayRecord.find(pay_id)

        if result['result_code'] == 'SUCCESS':
            p.set_state('success')
        else:
            p.set_state('fail')

        p.save()

        root = ET.Element('xml')

        sub = ET.SubElement(root, 'return_code')
        sub.text = 'SUCCESS'

        s = ET.tostring(root, encoding="utf-8", method="xml", short_empty_elements=True)
        s = s.decode()

        return s
    else:
        root = ET.Element('xml')

        sub = ET.SubElement(root, 'return_code')
        sub.text = 'FAIL'

        s = ET.tostring(root, encoding="utf-8", method="xml", short_empty_elements=True)
        s = s.decode()

        return s


@pay_api.route('/wxpay_check', methods=['POST'])
def wxpay_check():
    # request_data = request.data
    # request_data = json.loads(request_data)
    request_data = request.get_json()

    pay_id = request_data['pay_id']

    p = PayRecord.find(pay_id)

    r = {'result': p.pay_result}

    return jsonify(r)
