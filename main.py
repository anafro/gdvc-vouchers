import eel
from screeninfo import get_monitors


MONITOR = get_monitors().pop()
WINDOW_SIZE = (MONITOR.width, MONITOR.height)
WINDOW_POSITION = (int(MONITOR.width / 2 - WINDOW_SIZE[0] / 2), int(MONITOR.height / 2 - WINDOW_SIZE[1] / 2))

@eel.expose
def get_certificates() -> list[dict[str, str]]:
    return [
        {
            "id": 123456,
            "holder": "Иванов Иван Иванович",
            "phone": "+7 999 888 11 22",
            "service": "Химчистка ковров",
            "value": "9 900 рублей",
            "expire": "20 мая 2025",
        },
        {
            "id": 123456,
            "holder": "Иванов Иван Иванович",
            "phone": "+7 999 888 11 22",
            "service": "Химчистка ковров",
            "value": "9 930 рублей",
            "expire": "20 мая 2025",
        },
    ]

def main() -> None:
    eel.init('web')
    eel.start('index.html', size=WINDOW_SIZE, position=WINDOW_POSITION)


if __name__ == '__main__':
    main()