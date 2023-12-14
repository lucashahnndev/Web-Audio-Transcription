from fastapi import FastAPI, UploadFile, File
import io
import speech_recognition as sr
from pydub import AudioSegment

app = FastAPI()

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

@app.post("/upload_audio/")
@app.get("/upload_audio/")
async def upload_audio(file: UploadFile = File(...)):
    if file.content_type.startswith('audio'):
        contents = await file.read()

        # Verifica se o arquivo não está no formato WAV e converte para WAV
        if not file.filename.lower().endswith('.wav'):
            audio = AudioSegment.from_file(io.BytesIO(contents), format="ogg")  # Substitua "ogg" pelo formato atual do arquivo
            wav_data = io.BytesIO()
            audio.export(wav_data, format="wav")
            contents = wav_data.getvalue()

        texto_transcrito = transcrever_audio(contents)
        return {"transcribed_text": texto_transcrito}
    else:
        return {"detail": "Por favor, envie um arquivo de áudio válido."}



if __name__ == '__main__':
    import uvicorn
    uvicorn.run("api:app", reload=True, host="0.0.0.0")
