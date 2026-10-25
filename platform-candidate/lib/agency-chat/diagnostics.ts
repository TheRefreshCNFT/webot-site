export type AgencyChatDiagnosticCategory =
  | "provider_timeout"
  | "provider_transport"
  | "provider_status"
  | "provider_envelope"
  | "provider_length"
  | "provider_inner_json"
  | "contract_validation";

export type AgencyChatDiagnostic = (category: AgencyChatDiagnosticCategory) => void;
