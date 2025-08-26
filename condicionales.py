import cv2 

def condicionalesLetras(dedos, angulosid, frame, ultima_letra=''):
    font = cv2.FONT_HERSHEY_SIMPLEX
    letra_detectada = ''
    if dedos == [0, 1, 0, 0, 0, 0]:
        letra_detectada = ''
    # A
    elif dedos == [1, 1, 0, 0, 0, 0]:
        letra_detectada = 'A'
    # E
    elif dedos == [0, 0, 0, 0, 0, 0]:
        letra_detectada = 'E'
    # I
    elif dedos == [0, 0, 1, 0, 0, 0]:
        letra_detectada = 'I'
    # U
    elif dedos == [0, 0, 1, 0, 0, 1]:
        letra_detectada = 'U'
    # B (solo si no es D, porque D ya se evaluó antes)
    elif dedos == [0, 0, 1, 1, 1, 1]:
        letra_detectada = 'B'
    # L
    elif dedos == [1, 1, 0, 0, 0, 1]:
        letra_detectada = 'L'
    # W
    elif dedos == [0, 1, 0, 1, 1, 1]:
        letra_detectada = 'W'
    # Y
    elif dedos == [1, 1, 1, 0, 0, 0]:
        letra_detectada = 'Y'
    elif dedos == [0, 1, 0, 0, 1, 1]:
        letra_detectada = 'H'






    # Detectar O primero
    elif ((angulosid[0] > 40 and angulosid[0] < 160 and
       angulosid[1] > 40 and angulosid[1] < 160 and
       angulosid[2] > 40 and angulosid[2] < 160 and
       angulosid[3] > 40 and angulosid[3] < 160 and
       angulosid[4] > 40 and angulosid[4] < 160)
      or
      (angulosid[0] > 40 and angulosid[0] < 160 and
       angulosid[1] > 40 and angulosid[1] < 160 and
       angulosid[2] > 40 and angulosid[2] < 160 and
       angulosid[3] > 40 and angulosid[3] < 160 and
       angulosid[4] > 40 and angulosid[4] < 160)):
     letra_detectada = 'O'   

    # C (más tolerante con ángulos)
    elif (40 < angulosid[0] < 160 and
          40 < angulosid[1] < 160 and
          40 < angulosid[2] < 160 and
          40 < angulosid[3] < 160 and
          (angulosid[4] > 160 or angulosid[4] < 20)):
        letra_detectada = 'C'

# M: índice, medio y anular apuntando hacia la palma opuesta (parte trasera)
    elif (dedos[1] == 1 and dedos[2] == 1 and dedos[3] == 1 and
      angulosid[1] > 160 and   # índice hacia abajo
      angulosid[2] > 160 and   # medio hacia abajo
      angulosid[3] > 160):     # anular hacia abajo
        letra_detectada = 'M'
    # N: índice y medio apuntando hacia la palma opuesta (parte trasera)
    elif (dedos[1] == 1 and dedos[2] == 1 and
      angulosid[1] > 160 and   # índice hacia abajo
      angulosid[2] > 160):     # medio hacia abajo
     letra_detectada = 'N'



    


    # Mostrar solo si cambió la letra
    if letra_detectada != '' and letra_detectada != ultima_letra:
        cv2.rectangle(frame, (0, 0), (100, 100), (255, 255, 255), -1)
        cv2.putText(frame, letra_detectada, (20, 80), font, 3, (0, 0, 0), 2, cv2.LINE_AA)
        print(letra_detectada)

    return letra_detectada
