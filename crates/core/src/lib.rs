//! Copyright (c) 2026 Anon Rothschild. All rights reserved. Proprietary.
//! M0 stub for the shared sanitizer and ask/propose boundary.

#[derive(Debug, PartialEq)]
pub enum Decision {
    /// Route the prompt to the local model.
    LocalAsk,
    /// Refuse: fail closed.
    Refuse(&'static str),
}

/// Fails closed when no local model is present, and never falls back to the cloud.
pub fn route_ask(local_model_available: bool) -> Decision {
    if local_model_available { Decision::LocalAsk } else { Decision::Refuse("no local model") }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn fails_closed() {
        assert_eq!(route_ask(false), Decision::Refuse("no local model"));
    }
}
