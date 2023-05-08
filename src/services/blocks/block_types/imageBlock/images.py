from uuid import uuid4
from fastapi import HTTPException, status, UploadFile, Request
from src.services.blocks.schemas.blocks import Block
from src.services.blocks.utils.upload_files import upload_file_and_return_file_object

from src.services.users.users import PublicUser


async def create_image_block(request: Request, image_file: UploadFile, activity_id: str):
    blocks = request.app.db["blocks"]
    activity = request.app.db["activities"]

    block_type = "imageBlock"

    # get org_id from activity
    activity = await activity.find_one({"activity_id": activity_id}, {"_id": 0, "org_id": 1})
    org_id = activity["org_id"]

    # get block id
    block_id = str(f"block_{uuid4()}")

    block_data = await upload_file_and_return_file_object(request, image_file,  activity_id, block_id, ["jpg", "jpeg", "png", "gif"], block_type)

    # create block
    block = Block(block_id=block_id, activity_id=activity_id,
                  block_type=block_type, block_data=block_data, org_id=org_id)

    # insert block
    await blocks.insert_one(block.dict())

    return block


async def get_image_block(request: Request, file_id: str, current_user: PublicUser):
    blocks = request.app.db["blocks"]

    video_block = await blocks.find_one({"block_id": file_id})

    if video_block:
        return Block(**video_block)

    else:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Image block does not exist")
