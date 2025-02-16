import eel
from screeninfo import get_monitors

from models.certificate import Certificate, initialize_db


MONITOR = get_monitors().pop()
WINDOW_SIZE = (MONITOR.width, MONITOR.height)
WINDOW_POSITION = (int(MONITOR.width / 2 - WINDOW_SIZE[0] / 2), int(MONITOR.height / 2 - WINDOW_SIZE[1] / 2))

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


def main() -> None:
    initialize_db()
    eel.init('web')
    eel.start('index.html', size=WINDOW_SIZE, position=WINDOW_POSITION)


if __name__ == '__main__':
    main()