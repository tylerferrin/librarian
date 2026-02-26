// Chase Bliss Audio Clean MIDI CC mapping - infrastructure layer

use super::types::{CleanParameter, CleanState};
use std::collections::HashMap;

pub const CC_PRESET_SAVE: u8 = 111;

impl CleanParameter {
    /// Get the CC number for this parameter
    pub fn cc_number(&self) -> u8 {
        match self {
            CleanParameter::Dynamics(_) => 14,
            CleanParameter::Sensitivity(_) => 15,
            CleanParameter::Wet(_) => 16,
            CleanParameter::Attack(_) => 17,
            CleanParameter::Eq(_) => 18,
            CleanParameter::Dry(_) => 19,
            CleanParameter::RampSpeed(_) => 20,

            CleanParameter::ReleaseMode(_) => 21,
            CleanParameter::EffectMode(_) => 22,
            CleanParameter::PhysicsMode(_) => 23,

            CleanParameter::NoiseGateRelease(_) => 24,
            CleanParameter::NoiseGateSens(_) => 25,
            CleanParameter::SwellIn(_) => 26,
            CleanParameter::UserRelease(_) => 27,
            CleanParameter::BalanceFilter(_) => 28,
            CleanParameter::SwellOut(_) => 29,
            CleanParameter::EnvelopeMode(_) => 31,
            CleanParameter::ShiftyMode(_) => 32,
            CleanParameter::SpreadRouting(_) => 33,

            CleanParameter::Bypass(_) => 102,
            CleanParameter::Swell(_) => 103,
            CleanParameter::AltMode(_) => 104,
            CleanParameter::SwellHold(_) => 105,
            CleanParameter::DynamicsMax(_) => 106,

            CleanParameter::DipDynamics(_) => 61,
            CleanParameter::DipAttack(_) => 62,
            CleanParameter::DipEq(_) => 63,
            CleanParameter::DipDry(_) => 64,
            CleanParameter::DipWet(_) => 65,
            CleanParameter::DipBounce(_) => 66,
            CleanParameter::DipSweep(_) => 67,
            CleanParameter::DipPolarity(_) => 68,

            CleanParameter::DipMiso(_) => 71,
            CleanParameter::DipSpread(_) => 72,
            CleanParameter::DipLatch(_) => 73,
            CleanParameter::DipSidechain(_) => 74,
            CleanParameter::DipNoiseGate(_) => 75,
            CleanParameter::DipMotion(_) => 76,
            CleanParameter::DipSwellAux(_) => 77,
            CleanParameter::DipDusty(_) => 78,

            CleanParameter::RampBounce(_) => 52,
            CleanParameter::Expression(_) => 100,
            CleanParameter::PresetSave(_) => 111,
        }
    }

    /// Get the CC value for this parameter
    pub fn cc_value(&self) -> u8 {
        match self {
            // Continuous parameters
            CleanParameter::Dynamics(v)
            | CleanParameter::Sensitivity(v)
            | CleanParameter::Wet(v)
            | CleanParameter::Attack(v)
            | CleanParameter::Eq(v)
            | CleanParameter::Dry(v)
            | CleanParameter::RampSpeed(v)
            | CleanParameter::NoiseGateRelease(v)
            | CleanParameter::NoiseGateSens(v)
            | CleanParameter::SwellIn(v)
            | CleanParameter::UserRelease(v)
            | CleanParameter::BalanceFilter(v)
            | CleanParameter::SwellOut(v)
            | CleanParameter::ShiftyMode(v)
            | CleanParameter::Expression(v)
            | CleanParameter::PresetSave(v) => *v,

            // Enum parameters
            CleanParameter::ReleaseMode(m) => m.to_cc_value(),
            CleanParameter::EffectMode(m) => m.to_cc_value(),
            CleanParameter::PhysicsMode(m) => m.to_cc_value(),
            CleanParameter::EnvelopeMode(m) => m.to_cc_value(),
            CleanParameter::SpreadRouting(m) => m.to_cc_value(),
            CleanParameter::DipSweep(d) => d.to_cc_value(),
            CleanParameter::DipPolarity(p) => p.to_cc_value(),

            // Binary parameters
            CleanParameter::Bypass(b)
            | CleanParameter::Swell(b)
            | CleanParameter::AltMode(b)
            | CleanParameter::SwellHold(b)
            | CleanParameter::DynamicsMax(b)
            | CleanParameter::DipDynamics(b)
            | CleanParameter::DipAttack(b)
            | CleanParameter::DipEq(b)
            | CleanParameter::DipDry(b)
            | CleanParameter::DipWet(b)
            | CleanParameter::DipBounce(b)
            | CleanParameter::DipMiso(b)
            | CleanParameter::DipSpread(b)
            | CleanParameter::DipLatch(b)
            | CleanParameter::DipSidechain(b)
            | CleanParameter::DipNoiseGate(b)
            | CleanParameter::DipMotion(b)
            | CleanParameter::DipSwellAux(b)
            | CleanParameter::DipDusty(b)
            | CleanParameter::RampBounce(b) => {
                if *b { 127 } else { 0 }
            }
        }
    }

    /// Get a human-readable name for this parameter
    pub fn name(&self) -> &'static str {
        match self {
            CleanParameter::Dynamics(_) => "Dynamics",
            CleanParameter::Sensitivity(_) => "Sensitivity",
            CleanParameter::Wet(_) => "Wet",
            CleanParameter::Attack(_) => "Attack",
            CleanParameter::Eq(_) => "EQ",
            CleanParameter::Dry(_) => "Dry",
            CleanParameter::RampSpeed(_) => "Ramp Speed",
            CleanParameter::ReleaseMode(_) => "Release Mode",
            CleanParameter::EffectMode(_) => "Effect Mode",
            CleanParameter::PhysicsMode(_) => "Physics Mode",
            CleanParameter::NoiseGateRelease(_) => "Noise Gate Release",
            CleanParameter::NoiseGateSens(_) => "Noise Gate Sens",
            CleanParameter::SwellIn(_) => "Swell In",
            CleanParameter::UserRelease(_) => "User Release",
            CleanParameter::BalanceFilter(_) => "Balance Filter",
            CleanParameter::SwellOut(_) => "Swell Out",
            CleanParameter::EnvelopeMode(_) => "Envelope Mode",
            CleanParameter::ShiftyMode(_) => "Shifty Mode",
            CleanParameter::SpreadRouting(_) => "Spread Routing",
            CleanParameter::Bypass(_) => "Bypass",
            CleanParameter::Swell(_) => "Swell",
            CleanParameter::AltMode(_) => "Alt Mode",
            CleanParameter::SwellHold(_) => "Swell Hold",
            CleanParameter::DynamicsMax(_) => "Dynamics Max",
            CleanParameter::DipDynamics(_) => "DIP: Dynamics",
            CleanParameter::DipAttack(_) => "DIP: Attack",
            CleanParameter::DipEq(_) => "DIP: EQ",
            CleanParameter::DipDry(_) => "DIP: Dry",
            CleanParameter::DipWet(_) => "DIP: Wet",
            CleanParameter::DipBounce(_) => "DIP: Bounce",
            CleanParameter::DipSweep(_) => "DIP: Sweep",
            CleanParameter::DipPolarity(_) => "DIP: Polarity",
            CleanParameter::DipMiso(_) => "DIP: Miso",
            CleanParameter::DipSpread(_) => "DIP: Spread",
            CleanParameter::DipLatch(_) => "DIP: Latch",
            CleanParameter::DipSidechain(_) => "DIP: Sidechain",
            CleanParameter::DipNoiseGate(_) => "DIP: Noise Gate",
            CleanParameter::DipMotion(_) => "DIP: Motion",
            CleanParameter::DipSwellAux(_) => "DIP: Swell Aux",
            CleanParameter::DipDusty(_) => "DIP: Dusty",
            CleanParameter::RampBounce(_) => "Ramp/Bounce",
            CleanParameter::Expression(_) => "Expression",
            CleanParameter::PresetSave(_) => "Preset Save",
        }
    }
}

impl CleanState {
    /// Convert the current state to a map of CC numbers → CC values.
    /// Used when recalling a full preset (sending all parameters at once).
    pub fn to_cc_map(&self) -> HashMap<u8, u8> {
        let mut map = HashMap::new();

        // Main knobs
        map.insert(14, self.dynamics);
        map.insert(15, self.sensitivity);
        map.insert(16, self.wet);
        map.insert(17, self.attack);
        map.insert(18, self.eq);
        map.insert(19, self.dry);
        map.insert(20, self.ramp_speed);

        // Toggles
        map.insert(21, self.release_mode.to_cc_value());
        map.insert(22, self.effect_mode.to_cc_value());
        map.insert(23, self.physics_mode.to_cc_value());

        // Hidden options
        map.insert(24, self.noise_gate_release);
        map.insert(25, self.noise_gate_sens);
        map.insert(26, self.swell_in);
        map.insert(27, self.user_release);
        map.insert(28, self.balance_filter);
        map.insert(29, self.swell_out);
        map.insert(31, self.envelope_mode.to_cc_value());
        map.insert(32, self.shifty_mode);
        map.insert(33, self.spread_routing.to_cc_value());

        // Footswitches
        map.insert(102, if self.bypass { 127 } else { 0 });
        map.insert(103, if self.swell { 127 } else { 0 });
        map.insert(104, if self.alt_mode { 127 } else { 0 });
        map.insert(105, if self.swell_hold { 127 } else { 0 });
        map.insert(106, if self.dynamics_max { 127 } else { 0 });

        // DIP switches - Left bank
        map.insert(61, if self.dip_dynamics { 127 } else { 0 });
        map.insert(62, if self.dip_attack { 127 } else { 0 });
        map.insert(63, if self.dip_eq { 127 } else { 0 });
        map.insert(64, if self.dip_dry { 127 } else { 0 });
        map.insert(65, if self.dip_wet { 127 } else { 0 });
        map.insert(66, if self.dip_bounce { 127 } else { 0 });
        map.insert(67, self.dip_sweep.to_cc_value());
        map.insert(68, self.dip_polarity.to_cc_value());

        // DIP switches - Right bank
        map.insert(71, if self.dip_miso { 127 } else { 0 });
        map.insert(72, if self.dip_spread { 127 } else { 0 });
        map.insert(73, if self.dip_latch { 127 } else { 0 });
        map.insert(74, if self.dip_sidechain { 127 } else { 0 });
        map.insert(75, if self.dip_noise_gate { 127 } else { 0 });
        map.insert(76, if self.dip_motion { 127 } else { 0 });
        map.insert(77, if self.dip_swell_aux { 127 } else { 0 });
        map.insert(78, if self.dip_dusty { 127 } else { 0 });

        // Utility
        map.insert(52, if self.ramp_bounce { 127 } else { 0 });
        map.insert(100, self.expression);

        map
    }
}
