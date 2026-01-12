# Built with Seahorse v0.2.0

from seahorse.prelude import *

# This is your program's public key and it will update
# automatically when you build the project.
declare_id('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS')

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
    data: Array[u8, 808] # 808 bytes

@instruction
def init_certificate(payer: Signer, sender: Signer, owner: Account, cert: Empty[Certificate], seed_8: u64, data: Array[u8, 808]):
    cert = cert.init(payer = payer, seeds = [sender, 'certificate', seed_8])
    cert.sender = sender.key()
    cert.owner = owner.key()
    cert.data = data    