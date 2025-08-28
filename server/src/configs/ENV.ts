import jetEnv, { num, str } from 'jet-env';

const ENV = jetEnv({
  ClientOuterPort: num,
  ServerInnerPort: num,
  ApplicationHost: str,
  OpenAiApiKey: str,
  InfinitePayIndexDir: str,
  RedisUrl: str
});

export default ENV;