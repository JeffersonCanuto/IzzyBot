import jetEnv, { num, str } from 'jet-env';

const ENV = jetEnv({
  ClientOuterPort: num,
  ServerInnerPort: num,
  OpenAiApiKey: str,
  InfinitePayIndexDir: str,
  RedisUrl: str
});

export default ENV;