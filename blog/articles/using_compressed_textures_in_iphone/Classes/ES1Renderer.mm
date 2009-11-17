//
//  ES1Renderer.m
//  GLSample1
//
//  Created by 伊藤 千光 on 09/11/17.
//  Copyright __MyCompanyName__ 2009. All rights reserved.
//

#import "ES1Renderer.h"
#import "PVRLoader.h"

// 深度バッファのハンドルを格納するグローバル関数
static GLuint depthBuffer = 0;

static void createDepthBuffer(GLuint screenWidth, GLuint screenHeight) {
    if(depthBuffer) {
        glDeleteRenderbuffersOES(1, &depthBuffer);
        depthBuffer = 0;
    }
    glGenRenderbuffersOES(1, &depthBuffer);
    glBindRenderbufferOES(GL_RENDERBUFFER_OES, depthBuffer);
    glRenderbufferStorageOES(GL_RENDERBUFFER_OES,
                             GL_DEPTH_COMPONENT16_OES,
                             screenWidth, screenHeight);
    glFramebufferRenderbufferOES(GL_FRAMEBUFFER_OES,
                                 GL_DEPTH_ATTACHMENT_OES,
                                 GL_RENDERBUFFER_OES,
                                 depthBuffer);
    glEnable(GL_DEPTH_TEST);
}

// VBOのハンドルを格納するグローバル変数
static GLuint sphereVBO;
static GLuint sphereIBO;

// 頂点のデータ構造を定義する構造体
typedef struct _Vertex {
    GLfloat x, y, z;
    GLfloat nx, ny, nz;
    GLfloat u, v;
} Vertex;

static void createSphere() {
    Vertex   sphereVertices[17 * 9];
    GLushort sphereIndices[3 * 32 * 8];

    // 頂点データを生成
    Vertex* vertex = sphereVertices;
    for(int i = 0 ; i <= 8 ; ++i) {
        GLfloat v = i / 8.0f;
        GLfloat y = cosf(M_PI * v);
        GLfloat r = sinf(M_PI * v);
        for(int j = 0 ; j <= 16 ; ++j) {
            GLfloat u = j / 16.0f;
            Vertex data = {
                cosf(2 * M_PI * u) * r,  y, sinf(2 * M_PI * u) * r, // 座標
                cosf(2 * M_PI * u) * r,  y, sinf(2 * M_PI * u) * r, // 法線
                u, v                                                // UV
            };
            *vertex++ = data;
        }
    }

    // インデックスデータを生成
    GLushort* index = sphereIndices;
    for(int j = 0 ; j < 8 ; ++j) {
        int base = j * 17;
        for(int i = 0 ; i < 16 ; ++i) {
            *index++ = base + i;
            *index++ = base + i + 1;
            *index++ = base + i + 17;
            *index++ = base + i + 17;
            *index++ = base + i + 1;
            *index++ = base + i + 1 + 17;
        }
    }

    // VBOを作成
    GLuint buffers[2];
    glGenBuffers(2, buffers);
    sphereVBO = buffers[0];
    sphereIBO = buffers[1];

    // VBOを初期化し、データをコピー。
    glBindBuffer(GL_ARRAY_BUFFER, sphereVBO);
    glBufferData(GL_ARRAY_BUFFER, sizeof(sphereVertices),sphereVertices,GL_STATIC_DRAW);
    glBindBuffer(GL_ARRAY_BUFFER, 0);

    // IBOを初期化し、データをコピー。
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, sphereIBO);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(sphereIndices), sphereIndices, GL_STATIC_DRAW);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);
}

// テクスチャのハンドルを格納するグローバル変数
static GLuint earthTexture;

static void loadTexture() {
    // テクスチャを作成
    glGenTextures(1, &earthTexture);
    glBindTexture(GL_TEXTURE_2D, earthTexture);

    // 画像ファイルを読み込む
    PVRLoader loader;
    loader.LoadFromFile([[[NSBundle mainBundle] pathForResource:@"earth" ofType:@"pvr"] UTF8String]);
    loader.Submit();
    glBindTexture(GL_TEXTURE_2D, 0);
}

static void drawScene(GLfloat screenWidth, GLfloat screenHeight) {
    // 画面をクリア
    glViewport(0, 0, screenWidth, screenHeight);
    glClearColor(0.3f, 0.3f, 0.3f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    // ライトとマテリアルの設定
    const GLfloat lightPos[]     = { 1.0f, 1.0f, 1.0f, 0.0f };
    const GLfloat lightColor[]   = { 1.0f, 1.0f, 1.0f, 1.0f };
    const GLfloat lightAmbient[] = { 0.0f, 0.0f, 0.0f, 1.0f };
    const GLfloat diffuse[]      = { 0.7f, 0.7f, 0.7f, 1.0f };
    const GLfloat ambient[]      = { 0.3f, 0.3f, 0.3f, 1.0f };

    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
    glEnable(GL_LIGHTING);
    glEnable(GL_LIGHT0);
    glLightfv(GL_LIGHT0, GL_POSITION, lightPos);
    glLightfv(GL_LIGHT0, GL_DIFFUSE, lightColor);
    glLightfv(GL_LIGHT0, GL_AMBIENT, lightAmbient);
    glMaterialfv(GL_FRONT_AND_BACK, GL_DIFFUSE, diffuse);
    glMaterialfv(GL_FRONT_AND_BACK, GL_AMBIENT, ambient);

    // シーンの射影行列を設定
    glMatrixMode(GL_PROJECTION);
    const GLfloat near  = 0.1f, far = 1000.0f;
    const GLfloat aspect = screenWidth / screenHeight;
    const GLfloat width = near * tanf(M_PI * 60.0f / 180.0f / 2.0f);
    glLoadIdentity();
    glFrustumf(-width, width, -width / aspect, width / aspect, near, far);

    // 球体の変換行列を設定
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
    glTranslatef(0.0, 0.0, -3.0);

    // 頂点データを設定
    glEnableClientState(GL_VERTEX_ARRAY);
    glEnableClientState(GL_NORMAL_ARRAY);
    glEnableClientState(GL_TEXTURE_COORD_ARRAY);

    glBindBuffer(GL_ARRAY_BUFFER, sphereVBO);

    glVertexPointer(3, GL_FLOAT, sizeof(Vertex), 0);
    glNormalPointer(GL_FLOAT, sizeof(Vertex), (GLvoid*)(sizeof(GLfloat)*3));
    glTexCoordPointer(2, GL_FLOAT, sizeof(Vertex), (GLvoid*)(sizeof(GLfloat)*6));

    // インデックスデータを設定
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, sphereIBO);

    // テクスチャを設定して、双線形補完を有効にする
    glEnable(GL_TEXTURE_2D);
    glBindTexture(GL_TEXTURE_2D, earthTexture);
    glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

	// 球体を回転させる
	static GLfloat angle = 0.0f;
	angle += 1.0f;
	glRotatef(angle, 0.0f, 1.0f, 0.0f);

    // 球体を描画
    glDrawElements(GL_TRIANGLES, 3 * 32 * 8, GL_UNSIGNED_SHORT, 0);
}

@implementation ES1Renderer

// Create an ES 1.1 context
- (id) init
{
	if (self = [super init])
	{
		context = [[EAGLContext alloc] initWithAPI:kEAGLRenderingAPIOpenGLES1];
        
        if (!context || ![EAGLContext setCurrentContext:context])
		{
            [self release];
            return nil;
        }
		
		// Create default framebuffer object. The backing will be allocated for the current layer in -resizeFromLayer
		glGenFramebuffersOES(1, &defaultFramebuffer);
		glGenRenderbuffersOES(1, &colorRenderbuffer);
		glBindFramebufferOES(GL_FRAMEBUFFER_OES, defaultFramebuffer);
		glBindRenderbufferOES(GL_RENDERBUFFER_OES, colorRenderbuffer);
		glFramebufferRenderbufferOES(GL_FRAMEBUFFER_OES, GL_COLOR_ATTACHMENT0_OES, GL_RENDERBUFFER_OES, colorRenderbuffer);
		createSphere();
		loadTexture();
	}
	
	return self;
}

- (void) render
{
    [EAGLContext setCurrentContext:context];
    glBindFramebufferOES(GL_FRAMEBUFFER_OES, defaultFramebuffer);
    drawScene(backingWidth, backingHeight);
    glBindRenderbufferOES(GL_RENDERBUFFER_OES, colorRenderbuffer);
    [context presentRenderbuffer:GL_RENDERBUFFER_OES];
}

- (BOOL) resizeFromLayer:(CAEAGLLayer *)layer
{
    // Allocate color buffer backing based on the current layer size
    glBindRenderbufferOES(GL_RENDERBUFFER_OES, colorRenderbuffer);
    [context renderbufferStorage:GL_RENDERBUFFER_OES fromDrawable:layer];
    glGetRenderbufferParameterivOES(GL_RENDERBUFFER_OES, GL_RENDERBUFFER_WIDTH_OES, &backingWidth);
    glGetRenderbufferParameterivOES(GL_RENDERBUFFER_OES, GL_RENDERBUFFER_HEIGHT_OES, &backingHeight);

    // 深度バッファを(再)作成する
    createDepthBuffer(backingWidth, backingHeight);

    if (glCheckFramebufferStatusOES(GL_FRAMEBUFFER_OES) != GL_FRAMEBUFFER_COMPLETE_OES)
    {
        NSLog(@"Failed to make complete framebuffer object %x", glCheckFramebufferStatusOES(GL_FRAMEBUFFER_OES));
        return NO;
    }

    return YES;
}

- (void) dealloc
{
	// Tear down GL
	if (defaultFramebuffer)
	{
		glDeleteFramebuffersOES(1, &defaultFramebuffer);
		defaultFramebuffer = 0;
	}

	if (colorRenderbuffer)
	{
		glDeleteRenderbuffersOES(1, &colorRenderbuffer);
		colorRenderbuffer = 0;
	}
	
	// Tear down context
	if ([EAGLContext currentContext] == context)
        [EAGLContext setCurrentContext:nil];
	
	[context release];
	context = nil;
	
	[super dealloc];
}

@end
