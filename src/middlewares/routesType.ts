import * as t from 'io-ts';

export const Query =t.type({
    loa:  t.union([t.string, t.number]),
    aes:  t.union([t.string, t.number,t.undefined]),
  });

let a:t.TypeOf<typeof Query>