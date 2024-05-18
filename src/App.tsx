import {
  Box,
  Button,
  Flex,
  Textarea,
  Heading,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Input,
  InputRightElement,
  InputGroup,
} from "@chakra-ui/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAudioRecord, useWhisper, useChatGPT, useOpenAI } from "./hooks";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ConfigSectionProps = {
  apiKeyRef;
  setApiKey;
  prompt;
  setPrompt;
}
const ConfigSection = (props) => {
  const {apiKeyRef, setApiKey, prompt, setPrompt} = {...props}
  const [show, setShow] = useState<boolean>(false);
  const toggleShow = () => setShow((show) => !show);

  const updateApiKey = (event) => {
    apiKeyRef.current = event.target.value;
    setApiKey(apiKeyRef.current);
  };

  return (
      <Accordion allowMultiple>
        <AccordionItem>
          <h3>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                Config
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h3>

          <AccordionPanel pb="4">
            <h3>API KEY</h3>
            <InputGroup>
              <Input
                placeholder="OpenAI API KEY"
                type={show ? "text" : "password"}
                defaultValue={apiKeyRef.current}
                onChange={updateApiKey}
              />
              <InputRightElement width="4.5rem">
                <Button p={2} h="1.75rem" size="sm" onClick={toggleShow}>
                  {show ? "Hide" : "Show"}
                </Button>
              </InputRightElement>
            </InputGroup>
          </AccordionPanel>

          <AccordionPanel pb="4">
            <h3>プロンプト</h3>
            <Textarea
              rows={6}
              placeholder="プロンプト"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
  )
}
function App() {
  const { setApiKey } = useOpenAI();
  const apiKeyRef = useRef(import.meta.env.VITE_OPENAI_API_KEY || "");
  useEffect(() => {
    setApiKey(apiKeyRef.current);
  }, [setApiKey]);
  const { recording, source, startRecording, stopRecording, revokeSource } = useAudioRecord();
  const { transcribeText, setTranscribeText, transcribe } = useWhisper(
    apiKeyRef.current
  );
  const [llmtext, setLlmtext] = useState<string>("");
  const { start } = useChatGPT(apiKeyRef.current, setLlmtext);
  const isTranscribingRef = useRef(false);

  const memorizedTransribe = useCallback(async () => {
    if (!isTranscribingRef.current) {
      isTranscribingRef.current = true;
      await transcribe(source);
      isTranscribingRef.current = false;
    }
  }, [transcribe]);

  const [prompt, setPrompt] = useState<string>(`
### 指示
入力された文章をGitHub Flavored Markdown (GFM) の報告資料形式に箇条書きに要約して書き換えてください。

### 条件
- 入力された文章をマークダウンの記法に従って整形すること。
- 見出しは文字を大きく表示されるようにすること
- 重要なポイントは太字で強調してください。
- 見出し、リスト、リンク、コードブロックなど、GFMの特徴的な要素を適用すること。
- 必要に応じて改行やスペースを追加して、見やすくすること。
- 箇条書きのインデントは段階的に行うこと。
- かっこの前後は半角スペースを入れること

### 入力
`);

  const handleOnClickRecord = () => {
    revokeSource()
    setTranscribeText("")
    startRecording()
  }

  const handleOnClickGPT = () => {
    setLlmtext("");
    const inputtext = `
${prompt}
${transcribeText}`;
    start(inputtext);
  };

  const handleOnClickStop = async () => {
    stopRecording();
  };

  useEffect(() => {
    if (source) {
      memorizedTransribe(source);
    }
  }, [source])

  return (
    <>
      <ConfigSection apiKeyRef={apiKeyRef} setApiKey={setApiKey} prompt={prompt} setPrompt={setPrompt}/>
      <Box alignItems="center">
        <Flex m={8} alignItems="center" justifyContent="center">
          {!recording && (
            <Button m={2} colorScheme="blue" onClick={handleOnClickRecord}>
              Record
            </Button>
          )}
          {recording && (
            <Button m={2} colorScheme="red" onClick={handleOnClickStop}>
              Stop
            </Button>
          )}
          {!recording &&(
            <Button m={2} colorScheme="blue" onClick={handleOnClickGPT}>
              文章整理
            </Button>
          )}
        </Flex>

        <Flex m={8} alignItems="center" justifyContent="center">
          {typeof source === "string" && source && <audio src={source} controls />}
        </Flex>

        <Box m={8} alignItems="center" justifyContent="center">
          <h2>文字起こし</h2>
          <Textarea
            m={4}
            rows={6}
            placeholder="Whisper Response"
            value={transcribeText}
            onChange={(e) => setTranscribeText(e.target.value)}
          />
        </Box>

        {llmtext && (
          <Box mx={16}>
            <Heading as="h2" my={2}>
              文章整理
            </Heading>
            <Box>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {llmtext}
              </ReactMarkdown>
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
}

export default App;
