import { AuthApiError, isAuthApiError, type PostgrestError } from "@supabase/supabase-js";

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

/**
 * Translates a Postgrest/Postgres error from a table mutation (leads, deals,
 * activities, ...) to a PT-BR message safe to show a user — CLAUDE.md §6:
 * Server Action errors never leak a raw Postgres message.
 *
 * Matched by error `code` — Postgrest forwards the SQLSTATE for database
 * errors (foreign key, RLS) and its own PGRST codes for schema/request
 * problems — never by `message`, which carries table and column names.
 */
export function translateDatabaseError(error: PostgrestError): string {
  switch (error.code) {
    case "42501": // insufficient_privilege — RLS rejected the row.
      return "Você não tem permissão para fazer isso.";
    case "23503": // foreign_key_violation
      return "Este registro faz referência a algo que não existe mais.";
    case "23514": // check_violation
      return "Verifique os dados informados e tente novamente.";
    case "PGRST116": // no row found for a query expecting exactly one
      return "Registro não encontrado.";
    default:
      return "Não foi possível salvar. Tente novamente em instantes.";
  }
}
