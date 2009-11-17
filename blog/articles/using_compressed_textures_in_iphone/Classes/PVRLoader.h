#ifndef PVRLOADER_H
#define PVRLOADER_H

#include<OpenGLES/ES1/gl.h>
#include<OpenGLES/ES1/glext.h>

class PVRLoader
{
public:

    enum Constants
    {
        PVR_FLAG_TYPE_PVRTC_2 = 24,
        PVR_FLAG_TYPE_PVRTC_4 = 25,
        PVR_FLAG_TYPE_MASK    = 0xff,
        PVR_MAX_SURFACES      = 16
    };

    struct Header
    {
        uint32_t headerSize;
        uint32_t height;
        uint32_t width;
        uint32_t numMipmaps;
        uint32_t flags;
        uint32_t dataSize;
        uint32_t bpp;
        uint32_t bitmaskRed;
        uint32_t bitmaskGreen;
        uint32_t bitmaskBlue;
        uint32_t bitmaskAlpha;
        uint32_t tag;
        uint32_t numSurfaces;
    };

    struct Surface
    {
        GLuint      size;
        const void* bits;
    };

    PVRLoader();
    ~PVRLoader();
    bool LoadFromFile(const char* path);
    bool LoadFromMemory(const void* data);
    bool Submit();

    GLuint         GetWidth()               const { return width; }
    GLuint         GetHeight()              const { return height; }
    GLenum         GetFormat()              const { return format; }
    bool           HasAlpha()               const { return hasAlpha; }
    GLuint         GetSurfaceCount()        const { return numSurfaces; }
    const Surface& GetSurface(GLuint level) const { return surfaces[level]; }

private:

    GLuint  width;
    GLuint  height;
    GLenum  format;
    bool    hasAlpha;
    Surface surfaces[PVR_MAX_SURFACES];
    GLuint  numSurfaces;
    char*   readBuffer;

    static const char PVRIdentifier[4];

    void AllocReadBuffer(int size);
    void FreeReadBuffer();
};

#endif
