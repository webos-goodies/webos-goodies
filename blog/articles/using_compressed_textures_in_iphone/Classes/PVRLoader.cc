#include <libkern/OSByteOrder.h>
#include <fstream>
#include "PVRLoader.h"

using namespace std;

const char PVRLoader::PVRIdentifier[4] = { 'P', 'V', 'R', '!' };

PVRLoader::PVRLoader()
{
    numSurfaces = 0;
    readBuffer  = NULL;
}

PVRLoader::~PVRLoader()
{
    FreeReadBuffer();
}

void PVRLoader::AllocReadBuffer(int size)
{
    FreeReadBuffer();
    readBuffer = new char[size];
}

void PVRLoader::FreeReadBuffer()
{
    if(readBuffer)
        delete[] readBuffer;
    readBuffer = NULL;
}

bool PVRLoader::LoadFromFile(const char* path)
{
    FreeReadBuffer();
    try {
        ifstream file;
        file.open(path);
        if(!file.good())
            return false;

        file.seekg(0, ios::end);
        int size = file.tellg();
        file.seekg(0, ios::beg);

        AllocReadBuffer(size);
        file.read(readBuffer, size);

        bool result = LoadFromMemory(readBuffer);
        if(!result)
            FreeReadBuffer();
        return result;
    } catch(...) {
        FreeReadBuffer();
        throw;
    }
}

bool PVRLoader::LoadFromMemory(const void* pData)
{
    const Header& header = *reinterpret_cast<const Header *>(pData);
    uint32_t      tag    = OSSwapLittleToHostInt32(header.tag);

    if(PVRIdentifier[0] != ((tag >>  0) & 0xff) ||
       PVRIdentifier[1] != ((tag >>  8) & 0xff) ||
       PVRIdentifier[2] != ((tag >> 16) & 0xff) ||
       PVRIdentifier[3] != ((tag >> 24) & 0xff))
    {
        return false;
    }

    uint32_t flags       = OSSwapLittleToHostInt32(header.flags);
    uint32_t formatFlags = flags & PVR_FLAG_TYPE_MASK;

    if(formatFlags == PVR_FLAG_TYPE_PVRTC_4 || formatFlags == PVR_FLAG_TYPE_PVRTC_2)
    {
        if(formatFlags == PVR_FLAG_TYPE_PVRTC_4)
            format = GL_COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
        else if(formatFlags == PVR_FLAG_TYPE_PVRTC_2)
            format = GL_COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
        else
            return false;

        width       = OSSwapLittleToHostInt32(header.width);
        height      = OSSwapLittleToHostInt32(header.height);
        hasAlpha    = OSSwapLittleToHostInt32(header.bitmaskAlpha) ? true : false;
        numSurfaces = 0;

        GLuint         w      = width;
        GLuint         h      = height;
        GLuint         offset = 0;
        GLuint         size   = OSSwapLittleToHostInt32(header.dataSize);
        const uint8_t* pBytes = reinterpret_cast<const uint8_t*>(pData) + sizeof(header);

        while(offset < size && numSurfaces < PVR_MAX_SURFACES)
        {
            GLuint   blockSize, widthBlocks, heightBlocks, bpp;
            Surface& surface = surfaces[numSurfaces++];

            if (formatFlags == PVR_FLAG_TYPE_PVRTC_4)
            {
                blockSize    = 4 * 4;
                widthBlocks  = w / 4;
                heightBlocks = h / 4;
                bpp = 4;
            }
            else
            {
                blockSize    = 8 * 4;
                widthBlocks  = w / 8;
                heightBlocks = h / 4;
                bpp = 2;
            }

            if (widthBlocks < 2)
                widthBlocks = 2;
            if (heightBlocks < 2)
                heightBlocks = 2;

            surface.size = widthBlocks * heightBlocks * ((blockSize  * bpp) / 8);
            surface.bits = &pBytes[offset];

            w       = (w >> 1) || 1;
            h       = (h >> 1) || 1;
            offset += surface.size;
        }

        return true;
    }
    else
    {
        return false;
    }
}

bool PVRLoader::Submit()
{
    if(numSurfaces <= 0)
        return false;

    GLuint w = width;
    GLuint h = height;

    for(GLuint i = 0 ; i < numSurfaces ; ++i)
    {
        const Surface& surface = surfaces[i];

        glCompressedTexImage2D(GL_TEXTURE_2D,
                               i,
                               format,
                               w,
                               h,
                               0,
                               surface.size,
                               surface.bits);
        w = (w >> 1) || 1;
        h = (h >> 1) || 1;
    }

    return true;
}
