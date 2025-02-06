import eel
from screeninfo import get_monitors


MONITOR = get_monitors().pop()
WINDOW_SIZE = (800, 500)
WINDOW_POSITION = (int(MONITOR.width / 2 - WINDOW_SIZE[0] / 2), int(MONITOR.height / 2 - WINDOW_SIZE[1] / 2))

def main() -> None:
    eel.init('web')
    eel.start('index.html', size=WINDOW_SIZE, position=WINDOW_POSITION)


if __name__ == '__main__':
    main()