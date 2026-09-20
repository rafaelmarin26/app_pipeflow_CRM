import { AuthApiError, isAuthApiError } from "@supabase/supabase-js";

/**
 * Translates Supabase Auth errors to PT-BR messages safe to show a user —
 * CLAUDE.md §6: Server Action errors never leak a raw provider message.
 *
 * Matched by `code` (stable across SDK versions) rather than `message`, which
 * Supabase only ever ships in English and can reword without notice.
 */
export function translateAuthError(error: unknown): string {
  if (!isAuthApiError(error)) {
    return "Não foi possível concluir. Tente novamente em instantes.";
  }

  const code = (error as AuthApiError).code;

  switch (code) {
    case "invalid_credentials":
      return "E-mail ou senha incorretos.";
    case "email_not_confirmed":
      return "Confirme seu e-mail antes de entrar.";
    case "user_already_exists":
    case "email_exists":
      return "Este e-mail já está cadastrado. Faça login ou recupere sua senha.";
    case "weak_password":
      return "Senha muito fraca. Use pelo menos 8 caracteres, uma letra e um número.";
    case "email_address_invalid":
    case "email_address_not_authorized":
      return "Informe um e-mail válido.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Muitas tentativas. Aguarde um instante e tente de novo.";
    case "same_password":
      return "A nova senha precisa ser diferente da atual.";
    default:
      return "Não foi possível concluir. Tente novamente em instantes.";
  }
}
