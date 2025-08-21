import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import ChatService from '@src/services/ChatService';

import { IReq, IRes } from '@src/types';

async function create(req: IReq, res: IRes) {
  const { data: { message } } = req.body;
  await ChatService.create(message);
  
  res.status(HttpStatusCodes.CREATED).end();
}

export default { create } as const;