#![allow(unused_imports)]
#![allow(unused_variables)]
#![allow(unused_mut)]
use crate::{id, seahorse_util::*};
use anchor_lang::{prelude::*, solana_program};
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use std::{cell::RefCell, rc::Rc};

#[account]
#[derive(Debug)]
pub struct Certificate {
    pub sender: Pubkey,
    pub owner: Pubkey,
    pub data: [u8; 808],
}

impl<'info, 'entrypoint> Certificate {
    pub fn load(
        account: &'entrypoint mut Box<Account<'info, Self>>,
        programs_map: &'entrypoint ProgramsMap<'info>,
    ) -> Mutable<LoadedCertificate<'info, 'entrypoint>> {
        let sender = account.sender.clone();
        let owner = account.owner.clone();
        let data = Mutable::new(account.data.clone());

        Mutable::new(LoadedCertificate {
            __account__: account,
            __programs__: programs_map,
            sender,
            owner,
            data,
        })
    }

    pub fn store(loaded: Mutable<LoadedCertificate>) {
        let mut loaded = loaded.borrow_mut();
        let sender = loaded.sender.clone();

        loaded.__account__.sender = sender;

        let owner = loaded.owner.clone();

        loaded.__account__.owner = owner;

        let data = loaded.data.borrow().clone();

        loaded.__account__.data = data;
    }
}

#[derive(Debug)]
pub struct LoadedCertificate<'info, 'entrypoint> {
    pub __account__: &'entrypoint mut Box<Account<'info, Certificate>>,
    pub __programs__: &'entrypoint ProgramsMap<'info>,
    pub sender: Pubkey,
    pub owner: Pubkey,
    pub data: Mutable<[u8; 808]>,
}

pub fn init_certificate_handler<'info>(
    mut payer: SeahorseSigner<'info, '_>,
    mut sender: SeahorseSigner<'info, '_>,
    mut owner: UncheckedAccount<'info>,
    mut cert: Empty<Mutable<LoadedCertificate<'info, '_>>>,
    mut seed_8: u64,
    mut data: [u8 ; 808],
) -> () {
    let mut cert = cert.account.clone();

    assign!(cert.borrow_mut().sender, sender.key());

    assign!(cert.borrow_mut().owner, owner.key());

    assign!(cert.borrow_mut().data, Mutable::<[u8; 808]>::new(data));
}
