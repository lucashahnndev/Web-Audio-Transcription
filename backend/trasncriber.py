import io
import speech_recognition as sr

def transcrever_audio(blob):
    recognizer = sr.Recognizer()

    # Convertendo o Blob para um arquivo de áudio
    audio_file = io.BytesIO(blob)

    # Carregando o arquivo de áudio com o Recognizer
    with sr.AudioFile(audio_file) as source:
        audio_data = recognizer.record(source)

    # Realizando a transcrição do áudio
    try:
        texto_transcrito = recognizer.recognize_google(audio_data, language='pt-BR')
        return texto_transcrito
    except sr.UnknownValueError:
        return "Não foi possível transcrever o áudio."
    except sr.RequestError:
        return "Erro na requisição ao serviço de reconhecimento de voz."

# Exemplo de uso da função com um blob (substitua o 'seu_blob' pelo blob real)
# texto_transcrito = transcrever_audio(seu_blob)
