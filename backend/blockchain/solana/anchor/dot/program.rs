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
    pub fullname: [u16; 32],
    pub birthday: [u8; 4],
    pub delivery_date: [u8; 4],
    pub serial_id: [u16; 64],
    pub security_code: [u8; 32],
    pub more_info: [u16; 256],
    pub original_data_sha256: [u8; 32],
    pub original_image_sha256: [u8; 32],
}

impl<'info, 'entrypoint> Certificate {
    pub fn load(
        account: &'entrypoint mut Box<Account<'info, Self>>,
        programs_map: &'entrypoint ProgramsMap<'info>,
    ) -> Mutable<LoadedCertificate<'info, 'entrypoint>> {
        let sender = account.sender.clone();
        let owner = account.owner.clone();
        let fullname = Mutable::new(account.fullname.clone());
        let birthday = Mutable::new(account.birthday.clone());
        let delivery_date = Mutable::new(account.delivery_date.clone());
        let serial_id = Mutable::new(account.serial_id.clone());
        let security_code = Mutable::new(account.security_code.clone());
        let more_info = Mutable::new(account.more_info.clone());
        let original_data_sha256 =
            Mutable::new(account.original_data_sha256.clone());

        let original_image_sha256 =
            Mutable::new(account.original_image_sha256.clone());

        Mutable::new(LoadedCertificate {
            __account__: account,
            __programs__: programs_map,
            sender,
            owner,
            fullname,
            birthday,
            delivery_date,
            serial_id,
            security_code,
            more_info,
            original_data_sha256,
            original_image_sha256,
        })
    }

    pub fn store(loaded: Mutable<LoadedCertificate>) {
        let mut loaded = loaded.borrow_mut();
        let sender = loaded.sender.clone();

        loaded.__account__.sender = sender;

        let owner = loaded.owner.clone();

        loaded.__account__.owner = owner;

        let fullname = loaded.fullname.borrow().clone();

        loaded.__account__.fullname = fullname;

        let birthday = loaded.birthday.borrow().clone();

        loaded.__account__.birthday = birthday;

        let delivery_date = loaded.delivery_date.borrow().clone();

        loaded.__account__.delivery_date = delivery_date;

        let serial_id = loaded.serial_id.borrow().clone();

        loaded.__account__.serial_id = serial_id;

        let security_code = loaded.security_code.borrow().clone();

        loaded.__account__.security_code = security_code;

        let more_info = loaded.more_info.borrow().clone();

        loaded.__account__.more_info = more_info;

        let original_data_sha256 =
            loaded.original_data_sha256.borrow().clone();

        loaded.__account__.original_data_sha256 = original_data_sha256;

        let original_image_sha256 =
            loaded.original_image_sha256.borrow().clone();

        loaded.__account__.original_image_sha256 = original_image_sha256;
    }
}

#[derive(Debug)]
pub struct LoadedCertificate<'info, 'entrypoint> {
    pub __account__: &'entrypoint mut Box<Account<'info, Certificate>>,
    pub __programs__: &'entrypoint ProgramsMap<'info>,
    pub sender: Pubkey,
    pub owner: Pubkey,
    pub fullname: Mutable<[u16; 32]>,
    pub birthday: Mutable<[u8; 4]>,
    pub delivery_date: Mutable<[u8; 4]>,
    pub serial_id: Mutable<[u16; 64]>,
    pub security_code: Mutable<[u8; 32]>,
    pub more_info: Mutable<[u16; 256]>,
    pub original_data_sha256: Mutable<[u8; 32]>,
    pub original_image_sha256: Mutable<[u8; 32]>,
}

pub fn init_certificate_handler<'info>(
    mut payer: SeahorseSigner<'info, '_>,
    mut sender: SeahorseSigner<'info, '_>,
    mut owner: UncheckedAccount<'info>,
    mut cert: Empty<Mutable<LoadedCertificate<'info, '_>>>,
    mut seed_8: u64,
    mut fullname: [u16; 32],
    mut birthday: [u8; 4],
    mut delivery_date: [u8; 4],
    mut serial_id: [u16; 64],
    mut security_code: [u8; 32],
    mut more_info: [u16; 256],
    mut original_data_sha256: [u8; 32],
    mut original_image_sha256: [u8; 32],
) -> () {
    let mut cert = cert.account.clone();

    assign!(cert.borrow_mut().sender, sender.key());

    assign!(cert.borrow_mut().owner, owner.key());

    assign!(cert.borrow_mut().fullname, Mutable::<[u16; 32]>::new(fullname));

    assign!(cert.borrow_mut().birthday, Mutable::<[u8; 4]>::new(birthday));

    assign!(cert.borrow_mut().delivery_date, Mutable::<[u8; 4]>::new(delivery_date));

    assign!(cert.borrow_mut().serial_id, Mutable::<[u16; 64]>::new(serial_id));

    assign!(cert.borrow_mut().security_code, Mutable::<[u8; 32]>::new(security_code));

    assign!(cert.borrow_mut().more_info, Mutable::<[u16; 256]>::new(more_info));

    assign!(cert.borrow_mut().original_data_sha256, Mutable::<[u8; 32]>::new(original_data_sha256));

    assign!(cert.borrow_mut().original_image_sha256, Mutable::<[u8; 32]>::new(original_image_sha256));
}
