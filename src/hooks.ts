import { Dispatch, SetStateAction } from "react";
import { useState, useRef } from "react";
import { ChatOpenAI } from "@langchain/openai";
import { OpenAI } from "openai";

export const useOpenAI = () => {
  const [apiKey, setApiKey] = useState<string>("");
  return { apiKey, setApiKey };
};

export const useAudioRecord = () => {
  const [recording, setRecording] = useState(false);
  const [source, setSource] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder>();
  const chunks = useRef<BlobPart[]>([]);

  // 録音開始
  const startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        setRecording(true);
        chunks.current = [];
        const recoreder = new MediaRecorder(stream);
        if (!recoreder) return;
        mediaRecorder.current = recoreder;
        if (!mediaRecorder.current) return;
        mediaRecorder.current.ondataavailable = handleDataAvailable;
        mediaRecorder.current.start();
      })
      .catch((error) => {
        console.error("Error accessing microphone:", error);
      });
  };

  // 録音終了
  const stopRecording = () => {
    if (!mediaRecorder.current) return;
    setRecording(false);
    mediaRecorder.current.stop();
  };

  // 録音終了時のイベントハンドラ
  const handleDataAvailable = (event: BlobEvent) => {
    if (event.data.size === 0) return;

    chunks.current.push(event.data);
    const blob = new Blob(chunks.current, { type: "audio/webm" });
    // NOTE
    // ブラウザをリロードしない or revokeObjectURLをしない限り
    // メモリは確保されたままなので注意
    const audioUrl = URL.createObjectURL(blob);
    setSource(audioUrl);
  };

  const revokeSource = () => {
    if (source) {
      const audioUrl = source;
      setSource("");
      URL.revokeObjectURL(audioUrl);
    }
  };
  return { recording, source, startRecording, stopRecording, revokeSource };
};

export const useWhisper = (apiKey: string) => {
  // const [count, setCount] = useState<number>(0);
  const [transcribeText, setTranscribeText] = useState<string>("");
  const transcribe = async (url: string) => {
    // setCount((count) => count + 1);
    // if (count > 3) {
    //   console.error("too many call: ", count)
    //   return;
    // }
    fetch(url)
      .then((res) => {
        return res.blob();
      })
      .then((blobData) => {
        const openai = new OpenAI({
          apiKey: apiKey,
          dangerouslyAllowBrowser: true,
        });

        openai.audio.transcriptions
          .create({
            file: new File([blobData], "audio.webm", { type: blobData.type }),
            model: "whisper-1",
          })
          .then((res) => {
            setTranscribeText(res.text);
          })
          .catch((e) => {
            console.error(e);
          });
      });
  };

  return { transcribeText, setTranscribeText, transcribe };
};

export const useChatGPT = (
  apiKey: string,
  setLlmtext: Dispatch<SetStateAction<string>>
) => {
  const start = async (txt: string) => {
    const model = new ChatOpenAI({
      apiKey: apiKey,
      model: "gpt-4o",
      temperature: 0.7,
    });

    const stream = await model.stream(txt);
    for await (const chunk of stream) {
      if (chunk.content) {
        setLlmtext((m: string) => (m + chunk.content) as string);
      }
    }
  };
  return { start };
};
