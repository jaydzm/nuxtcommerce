import { GraphQLClient, type Variables } from 'graphql-request';
import { getCookie, setCookie, createError, type H3Event } from 'h3';

function getClient(): GraphQLClient {
  const { gqlHost } = useRuntimeConfig();
  return new GraphQLClient(gqlHost, { headers: { 'content-type': 'application/json' } });
}

async function handleError<T>(promise: Promise<T>, message: string): Promise<T> {
  try {
    return await promise;
  } catch (error: any) {
    throw createError({ statusCode: 502, statusMessage: error?.message || message });
  }
}

export async function requestQuery<T = unknown>(query: string, variables?: Variables): Promise<T> {
  return handleError(getClient().request<T>(query, variables), 'GraphQL query failed');
}

export async function requestMutation<T = unknown>(event: H3Event, query: string, variables?: Variables): Promise<T> {
  const session = getCookie(event, 'woocommerce-session');
  const client = getClient();

  const headers: Record<string, string> = {};
  if (session) {
    headers['woocommerce-session'] = session;
  }

  // 统一使用 rawRequest，确保无论是否有旧 session，都能捕获到最新的 woocommerce-session 响应头
  const res = await handleError(client.rawRequest<T>(query, variables, headers), 'GraphQL mutation failed');
  
  // 获取 WPGraphQL 返回的最新的 Session Token
  const newSession = res.headers.get('woocommerce-session');
  if (newSession) {
    // 适配移动端 Chrome/Android 规范的 Cookie 参数
    const isHttps = process.env.NODE_ENV === 'production' || event.node.req.headers['x-forwarded-proto'] === 'https';

    setCookie(event, 'woocommerce-session', `Session ${newSession}`, {
      path: '/',
      httpOnly: true,
      // 如果使用了 HTTPS，推荐 Secure + SameSite: None/Lax，确保 Android 设备能正常保存并携带 Cookie
      sameSite: isHttps ? 'lax' : 'lax', 
      secure: isHttps, 
      maxAge: 60 * 60 * 24 * 7, // 保持 7 天有效，防止 Android 挂起网页后 Session 丢失
    });
  }

  return res.data;
}
