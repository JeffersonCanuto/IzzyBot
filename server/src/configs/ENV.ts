import jetEnv, { num, str } from 'jet-env';
import { isEnumVal } from 'jet-validators';

import { NodeEnvs } from '.';

const ENV = jetEnv({
  NodeEnv: isEnumVal(NodeEnvs),
  Port: num,
  OpenAiApiKey: str
});

export default ENV;