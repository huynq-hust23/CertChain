# Built with Seahorse v0.2.0

from seahorse.prelude import *

# This is your program's public key and it will update
# automatically when you build the project.
declare_id('DrLi2HqpW1KM3mDTV8u2BHC7h5vZcGJPKCnoayZ1Rtrf')

"""Certificate
sender: Pubkey # 32 bytes
owner: Pubkey # 32 bytes
fullname: Array[u16, 32] # 32 characters max = 64 bytes
birthday: {
    day: u8, # 1 byte
    month: u8, # 1 byte
    year: u16 # 2 bytes
} # 4 bytes
delivery_date: {
    day: u8, # 1 byte
    month: u8, # 1 byte
    year: u16 # 2 bytes
} # 4 bytes
serial_id: Array[u16, 64] # 64 characters max = 128 bytes
security_code: Array[u8, 32] # 32 bytes
more_info: Array[u16, 256] # 256 characters max = 512 bytes
original_data_sha256: Array[u8, 32] # 32 bytes
original_image_sha256: Array[u8, 32] # 32 bytes

Certificate size: 64 + 4 + 4 + 128 + 32 + 512 + 32 + 32 = 808 bytes
"""

class Certificate(Account):
    sender: Pubkey # 32 bytes
    owner: Pubkey # 32 bytes
    fullname_u16_32_array: Array[u16, 32]
    birthday_u8_4_array: Array[u8, 4]
    delivery_date_u8_4_array: Array[u8, 4]
    serial_id_u16_64_array: Array[u16, 64]
    security_code_u8_32_array: Array[u8, 32]
    more_info_u16_256_array: Array[u16, 256]
    original_data_sha256_u8_32_array: Array[u8, 32]
    original_image_sha256_u8_32_array: Array[u8, 32]

@instruction
def init_certificate(
    payer: Signer,
    sender: Signer,
    owner: UncheckedAccount,
    cert: Empty[Certificate],
    seed_8: u64,
    fullname_u16_32_array: Array[u16, 32],
    birthday_u8_4_array: Array[u8, 4],
    delivery_date_u8_4_array: Array[u8, 4],
    serial_id_u16_64_array: Array[u16, 64],
    security_code_u8_32_array: Array[u8, 32],
    more_info_u16_256_array: Array[u16, 256],
    original_data_sha256_u8_32_array: Array[u8, 32],
    original_image_sha256_u8_32_array: Array[u8, 32]
):
    cert = cert.init(payer = payer, seeds = [sender, 'certificate', seed_8])
    cert.sender = sender.key()
    cert.owner = owner.key()
    cert.fullname_u16_32_array = fullname_u16_32_array
    cert.birthday_u8_4_array = birthday_u8_4_array
    cert.delivery_date_u8_4_array = delivery_date_u8_4_array
    cert.serial_id_u16_64_array = serial_id_u16_64_array
    cert.security_code_u8_32_array = security_code_u8_32_array
    cert.more_info_u16_256_array = more_info_u16_256_array
    cert.original_data_sha256_u8_32_array = original_data_sha256_u8_32_array
    cert.original_image_sha256_u8_32_array = original_image_sha256_u8_32_array