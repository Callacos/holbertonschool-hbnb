from app import create_app

import sys
print("run lancé", file=sys.stdout, flush=True)

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
