import cv2
import mediapipe as mp
from flask import Flask, Response, jsonify
from flask_cors import CORS
from Funciones.condicionales import condicionalesLetras
from Funciones.normalizacionCords import obtenerAngulos
import time

app = Flask(__name__)
CORS(app)

mp_drawing = mp.solutions.drawing_utils
mp_hands = mp.solutions.hands

cap = cv2.VideoCapture(0)
wCam, hCam = 1600, 900
cap.set(3, wCam)
cap.set(4, hCam)

ultima_letra = ''
ultimo_tiempo = 0

@app.route('/video_feed')
def video_feed():
    def gen_frames():
        with mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.75) as hands:

            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                height, width, _ = frame.shape
                frame = cv2.flip(frame, 1)
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                results = hands.process(frame_rgb)

                if results.multi_hand_landmarks is not None:
                    for hand_landmarks in results.multi_hand_landmarks:
                        mp_drawing.draw_landmarks(
                            frame,
                            hand_landmarks,
                            mp_hands.HAND_CONNECTIONS,
                            mp_drawing.DrawingSpec(color=(0,0,255), thickness=2, circle_radius=2),
                            mp_drawing.DrawingSpec(color=(0,255,0), thickness=2)
                        )

                    global ultima_letra, ultimo_tiempo
                    current_time = time.time()
                    if current_time - ultimo_tiempo >= 2:
                        angulosid = obtenerAngulos(results, width, height)[0]
                        dedos = []

                        dedos.append(1 if angulosid[5] > 125 else 0)
                        dedos.append(1 if angulosid[4] > 150 else 0)
                        for i in range(4):
                            dedos.append(1 if angulosid[i] > 90 else 0)

                        letra_detectada = condicionalesLetras(dedos, angulosid, frame)
                        if letra_detectada != '':
                            ultima_letra = letra_detectada
                        ultimo_tiempo = current_time

                ret, buffer = cv2.imencode('.jpg', frame)
                frame_bytes = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/letter')
def get_letter():
    global ultima_letra
    letra = ultima_letra
    ultima_letra = ''
    return jsonify({'letra': letra})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
