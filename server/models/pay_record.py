import json


def db_path():
    return 'db/pay_record.json'


def save(data, path):
    s = json.dumps(data, indent=2, ensure_ascii=False)
    with open(path, 'w+', encoding='utf-8') as f:
        f.write(s)


def load(path):
    with open(path, 'r', encoding='utf-8') as f:
        s = f.read()
        return json.loads(s)


class PayRecord(object):
    def __init__(self):
        self.pay_id = ''
        self.pay_record = ''

    @classmethod
    def new(cls, pay_id):
        p = cls()
        setattr(p, 'pay_id', pay_id)
        setattr(p, 'pay_result', 'pending')

        return p

    @classmethod
    def all(cls):
        path = db_path()
        all_data = load(path)

        return all_data

    @classmethod
    def find(cls, pay_id):
        all_data = cls.all()
        if pay_id in all_data:
            p = cls.new(pay_id)
            p.set_state(all_data[pay_id])

            return p
        else:
            return None

    def set_state(self, state):
        setattr(self, 'pay_result', state)

    def save(self):
        all_data = self.all()

        all_data[self.pay_id] = self.pay_result

        path = db_path()
        save(all_data, path)
