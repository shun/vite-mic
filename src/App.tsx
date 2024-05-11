import { Box, Button, Flex, Textarea, Heading } from "@chakra-ui/react";
import { useState } from "react";
import { useAudioRecord, useWhisper, useChatGPT } from "./hooks";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function App() {
  const { recording, source, startRecording, stopRecording } = useAudioRecord();
  const { transcribeText, transcribe } = useWhisper();
  const [llmtext, setLlmtext] = useState<string>("");
  const { start } = useChatGPT(setLlmtext);
  const handleOnClickGPT = () => {
    setLlmtext("");
    const inputtext = `
### 指示
入力されたテキストをGitHub フレーバのマークダウン形式に整形してください。
見出しを使用して主要なセクションを区切り、重要なポイントは太字で強調してください。
情報がリスト形式で表現できる部分は箇条書きを用いてください。
### 入力
${transcribeText}`;
    start(inputtext);
  };

  const handleOnClickStop = () => {
    stopRecording();
    transcribe(source);
  };

  return (
    <Box alignItems="center">
      <Flex m={8} alignItems="center" justifyContent="center">
        {!recording && !source && (
          <Button m={2} colorScheme="blue" onClick={startRecording}>
            Record
          </Button>
        )}
        {recording && (
          <Button m={2} colorScheme="red" onClick={handleOnClickStop}>
            Stop
          </Button>
        )}
        {source && (
          <Button m={2} colorScheme="blue" onClick={() => transcribe(source)}>
            Transcribe
          </Button>
        )}
        {transcribeText && (
          <Button m={2} colorScheme="blue" onClick={handleOnClickGPT}>
            GPT
          </Button>
        )}
      </Flex>
      <Flex m={8} alignItems="center" justifyContent="center">
        {typeof source === "string" && <audio src={source} controls />}
      </Flex>
      <Flex m={8} alignItems="center" justifyContent="center">
        <Textarea
          m={4}
          rows={6}
          placeholder="Whisper Response"
          value={transcribeText}
        />
      </Flex>
      {llmtext && (
        <Box mx={16}>
          <Heading as="h2" my={2}>
            要約
          </Heading>
          <Box>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{llmtext}</ReactMarkdown>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default App;
