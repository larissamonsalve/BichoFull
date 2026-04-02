/**
 * @description Objeto de Transferência de Dados (DTO) para o registro de novos usuários.
 */
export interface UserRegistrationDTO {
  /** Nome completo do usuário */
  name: string;
  /** Apelido único no sistema */
  username: string;
  /** Endereço de e-mail válido */
  email: string;
  /** Senha de acesso (Opcional após o registro, mas exigida na criação) */
  password?: string;
}