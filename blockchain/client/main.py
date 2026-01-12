from typing import Optional
import uvicorn

from fastapi import FastAPI, Body, Depends, HTTPException,  File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from config import *
from pydantic import BaseModel
import json

# import data
from hotaSolana.hotaSolanaDataBase import *
from hotaSolana.hotaSolanaData import *
from hotaSolana.bs58 import bs58

from baseAPI import *

app = FastAPI(title="Solana API",
              description="Solana API Management",
              version="v2.0",
              contact={
                  "name": "Hotamago Master",
                  "url": "https://www.linkedin.com/in/hotamago/",
              })

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Solana Client
client = HotaSolanaRPC(programId, False, "devnet")

# Solana instruction data
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

@BaseInstructionDataClass(name="init_certificate")
class CertificateInitInstruction:
    seed_8=HotaUint64(0)
    fullname=HotaStringUTF16(32)
    birthday=HotaDate()
    delivery_date=HotaDate()
    serial_id=HotaStringUTF16(64)
    security_code=HotaHex(32)
    more_info=HotaStringUTF16(256)
    original_data_sha256=HotaHex(32)
    original_image_sha256=HotaHex(32)

@BaseStructClass
class CertificateData:
    sender=HotaPublicKey()
    owner=HotaPublicKey()
    fullname=HotaStringUTF16(32)
    birthday=HotaDate()
    delivery_date=HotaDate()
    serial_id=HotaStringUTF16(64)
    security_code=HotaHex(32)
    more_info=HotaStringUTF16(256)
    original_data_sha256=HotaHex(32)
    original_image_sha256=HotaHex(32)

# Router
# @app.post("/convert-keypair-to-private-key")
# async def convert_keypair_to_private_key(file: UploadFile):
#     # Bytes to string
#     result = file.file.read()
#     keypair_json = json.loads(result)
#     keypair_bytes = bytes(keypair_json)
#     return {
#         "public_key": bs58.encode(keypair_bytes[32:]),
#         "private_key": bs58.encode(keypair_bytes),
#     }

class CertificateModel(BaseModel):
    fullname: str = "Example name"
    birthday: Date4Bytes = Date4Bytes()
    delivery_date: Date4Bytes = Date4Bytes()
    serial_id: str = "Example serial"
    security_code: str = "12345678"
    more_info: str = "Example info"
    original_data: str = "Example data"
    original_image: str = "base64 image"

def createBytesFromArrayBytes(*array_bytes):
    bytes_data = bytearray()
    for byte in array_bytes:
        bytes_data.extend(byte)
    return bytes(bytes_data)

@app.post("/init-certificate")
async def init_certificate(
    senderPrivateKey: str,
    ownerPublicKey: str,
    certificate: CertificateModel,
):
    # Validate
    validateStr = {
        "fullname": 32,
        "serial_id": 64,
        "more_info": 256,
    }
    # print(certificate.__dict__)
    for key, value in certificate.__dict__.items():
        if key in validateStr:
            if len(value) > validateStr[key]:
                return make_response("Length of " + key + " must be less than " + str(validateStr[key]), None, EnumStatus.ERROR)
        if isinstance(value, BaseValidate) and not value.validate():
            return make_response("Invalid " + key, None, EnumStatus.ERROR)

    certificate_data = CertificateInitInstruction()
    certificate_data.get("fullname").object2struct(certificate.fullname)
    certificate_data.get("birthday").object2struct(certificate.birthday.__dict__)
    certificate_data.get("delivery_date").object2struct(certificate.delivery_date.__dict__)
    certificate_data.get("serial_id").object2struct(certificate.serial_id)
    certificate_data.get("security_code").object2struct(hash256(certificate.security_code).hex())
    certificate_data.get("more_info").object2struct(certificate.more_info)
    certificate_data.get("original_data_sha256").object2struct(hash256(certificate.original_data).hex())
    certificate_data.get("original_image_sha256").object2struct(hash256(certificate.original_image).hex())
    certificate_data.get("seed_8").deserialize(hash256(certificate.model_dump_json())[:8])

    sender_keypair = makeKeyPair(senderPrivateKey)
    owner_public_key = makePublicKey(ownerPublicKey)
    certificate_public_key = findProgramAddress(
        createBytesFromArrayBytes(
            sender_keypair.public_key.byte_value,
            "certificate".encode("utf-8"),
            bytes(certificate_data.get("seed_8").serialize())
        ),
        client.program_id
    )

    return make_response_auto_catch(lambda: {
            "address_transaction": client.send_transaction(
                certificate_data,
                [
                    makeKeyPair(payerPrivateKey).public_key,
                    sender_keypair.public_key,
                    owner_public_key,
                    certificate_public_key,
                    makePublicKey("SysvarRent111111111111111111111111111111111"),
                    makePublicKey("11111111111111111111111111111111"),
                ],
                [
                    makeKeyPair(payerPrivateKey),
                    sender_keypair,
                ]
            ),
            "certificate_public_key": bs58.encode(certificate_public_key.byte_value),
        }
    )

@app.post("/check-security-code")
async def check_security_code(certificate_public_key: str, security_code: str):
    def check_security_code():
        certificate_data = client.get_account_data(PublicKey(certificate_public_key), CertificateData)
        if certificate_data["security_code"] == hash256(security_code).hex():
            return True
        return False
    return make_response_auto_catch(check_security_code)

@app.get("/get-certificate-info")
async def get_certificate_info(cert_public_key: str):
    return make_response_auto_catch(lambda: client.get_account_info(PublicKey(cert_public_key)))

@app.get("/get-certificate-data")
async def get_certificate_data(cert_public_key: str):
    return make_response_auto_catch(lambda: client.get_account_data(PublicKey(cert_public_key), CertificateData))

# @app.get("/get-balance")
# async def get_balance():
#     return make_response_auto_catch(client.get_balance())

# @app.post("/airdrop")
# async def airdrop(amount: int = 1):
#     return make_response_auto_catch(client.drop_sol(amount))

# Run
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=openPortAPI)
