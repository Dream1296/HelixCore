import { dtList, getLongVideoList, sqlGetDtIndexAll } from "./models/dt";
import { dbSql } from "./utils/dbSql";
//  ts-node -r tsconfig-paths/register src/test.ts

// sqlGetDtIndexAll().then(a => console.log(a));
// dtList('yw', 1).then(a => console.log(a[2]))
// getLongVideoList()

dtList('yw',1)
.then(
    a => console.log(a[0])
)



