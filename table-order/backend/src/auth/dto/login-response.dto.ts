export class AdminInfo {
  id: number;
  username: string;
  storeId: number;
  storeName: string;
}

export class TableInfo {
  id: number;
  tableNumber: number;
  storeId: number;
  storeName: string;
}

export class LoginResponseDto {
  accessToken: string;
  expiresIn: string;
  admin?: AdminInfo;
  table?: TableInfo;
}
