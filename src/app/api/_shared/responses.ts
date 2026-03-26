import { NextResponse } from "next/server";

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: string;
  details?: string;
  code?: string;
};

export function apiOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data } satisfies ApiSuccess<T>, init);
}

export function apiError(
  error: string,
  init?: ResponseInit & { details?: string; code?: string }
) {
  const body: ApiFailure = {
    success: false,
    error,
    details: init?.details,
    code: init?.code,
  };
  const { details: _d, code: _c, ...responseInit } = init ?? {};
  return NextResponse.json(body, responseInit);
}

