import sys

import eel
from screeninfo import get_monitors
import os

from models.certificate import Certificate, initialize_db


MONITOR = get_monitors().pop()
WINDOW_SIZE = (MONITOR.width, MONITOR.height)
WINDOW_POSITION = (int(MONITOR.width / 2 - WINDOW_SIZE[0] / 2), int(MONITOR.height / 2 - WINDOW_SIZE[1] / 2))


def get_web_folder():
    if hasattr(sys, '_MEIPASS'):
        # If running as a packaged exe, the path to the bundled web folder
        return os.path.join(sys._MEIPASS, 'web')
    else:
        # If running from source, use the local web folder
        return os.path.join(os.path.dirname(__file__), 'web')


@eel.expose
def get_certificates() -> list[dict[str, str]]:
    return Certificate.get_all_certificates_as_dictionaries()


@eel.expose
def create_certificate(holder: str, phone: str, service_type: str) -> None:
    (service, value) = {
        'dry-cleaning': ("Химчистка мягкой мебели и ковров", 500),
        'spring-cleaning': ("Генеральная уборка", 1000),
    }[service_type]

    Certificate.create_certificate(service, holder, phone, value)


@eel.expose
def delete_certificate(id: int) -> None:
    Certificate.delete_certificate_by_id(id)


@eel.expose
def close_python(*args):
    sys.exit()


def close(page, sockets_still_open):
    eel._stop()
    os._exit(0)


def main() -> None:
    initialize_db()
    eel.init(get_web_folder())
    eel.start('index.html', size=WINDOW_SIZE, position=WINDOW_POSITION, close_callback=close)

    try:
        while True:
            eel.sleep(10)
    except KeyboardInterrupt:
        print("Shutting down gracefully")
        eel.close()


if __name__ == '__main__':
    main()