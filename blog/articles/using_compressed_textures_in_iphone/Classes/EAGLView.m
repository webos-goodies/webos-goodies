//
//  EAGLView.m
//  iphone_gl
//
//  Created by 伊藤 千光 on 09/06/28.
//  Copyright __MyCompanyName__ 2009. All rights reserved.
//



#import <QuartzCore/QuartzCore.h>
#import <OpenGLES/EAGLDrawable.h>

#import "EAGLView.h"

#define USE_DEPTH_BUFFER 1

// VBO のハンドルを格納するグローバル変数
static GLuint vertices;
static GLuint indices;

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

    // VBO を作成
    GLuint buffers[2];
    glGenBuffers(2, buffers);
    vertices  = buffers[0];
    indices   = buffers[1];

    // 頂点用 VBO を初期化し、データをコピー。
    glBindBuffer(GL_ARRAY_BUFFER, vertices);
    glBufferData(GL_ARRAY_BUFFER, sizeof(sphereVertices),sphereVertices,GL_STATIC_DRAW);

    // インデックス用 VBO を初期化し、データをコピー。
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, indices);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(sphereIndices), sphereIndices, GL_STATIC_DRAW);
}

// テクスチャのハンドルを格納するグローバル変数
static GLuint texture;

static void loadTexture() {
    // 画像を読み込み、 32bit RGBA フォーマットのデータを取得
    CGImageRef image  = [UIImage imageNamed:@"earth.jpg"].CGImage;
    NSInteger  width  = CGImageGetWidth(image);
    NSInteger  height = CGImageGetHeight(image);
    GLubyte*   bits   = (GLubyte*)malloc(width * height * 4);
    CGContextRef textureContext =
        CGBitmapContextCreate(bits, width, height, 8, width * 4,
                              CGImageGetColorSpace(image), kCGImageAlphaPremultipliedLast);
    CGContextDrawImage(textureContext, CGRectMake(0.0, 0.0, width, height), image);
    CGContextRelease(textureContext);

    // テクスチャを作成し、データを転送
    glGenTextures(1, &texture);
    glBindTexture(GL_TEXTURE_2D, texture);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, bits);
    free(bits);

    // テクスチャを有効にして、双線形補完を有効にする
    glEnable(GL_TEXTURE_2D);
    glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
}

static void initializeGL(CGRect b) {
    glMatrixMode(GL_PROJECTION);
    const GLfloat near  = 0.1f, far = 1000.0f;
    GLfloat       width = near * tanf(M_PI * 60.0f / 180.0f / 2.0f);
    glFrustumf(-width,
               +width,
               -width / (b.size.width / b.size.height),
               +width / (b.size.width / b.size.height), near, far);
    glViewport(0, 0, b.size.width, b.size.height);

    glEnable(GL_DEPTH_TEST);

	createSphere();
	loadTexture();
}

static void drawScene() {
    // 画面をクリア
    glClearColor(0.3f, 0.3f, 0.3f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    glMatrixMode(GL_MODELVIEW);

	// ライトとマテリアルの設定
	const GLfloat lightPos[]     = { 1.0f, 1.0f, 1.0f, 0.0f };
	const GLfloat lightColor[]   = { 1.0f, 1.0f, 1.0f, 1.0f };
	const GLfloat lightAmbient[] = { 0.0f, 0.0f, 0.0f, 1.0f };
	const GLfloat diffuse[]      = { 0.7f, 0.7f, 0.7f, 1.0f };
	const GLfloat ambient[]      = { 0.3f, 0.3f, 0.3f, 1.0f };

	glLoadIdentity();
	glEnable(GL_LIGHTING);
	glEnable(GL_LIGHT0);
	glLightfv(GL_LIGHT0, GL_POSITION, lightPos);
	glLightfv(GL_LIGHT0, GL_DIFFUSE, lightColor);
	glLightfv(GL_LIGHT0, GL_AMBIENT, lightAmbient);
	glMaterialfv(GL_FRONT_AND_BACK, GL_DIFFUSE, diffuse);
	glMaterialfv(GL_FRONT_AND_BACK, GL_AMBIENT, ambient);

    // 球体の変換行列を設定
    glLoadIdentity();
    glTranslatef(0.0, 0.0, -3.0);

    // 頂点データを設定
    glEnableClientState(GL_VERTEX_ARRAY);
    glEnableClientState(GL_NORMAL_ARRAY);
    glEnableClientState(GL_TEXTURE_COORD_ARRAY);

    glBindBuffer(GL_ARRAY_BUFFER, vertices);

    glVertexPointer(3, GL_FLOAT, sizeof(Vertex), 0);
    glNormalPointer(GL_FLOAT, sizeof(Vertex), (GLvoid*)(sizeof(GLfloat)*3));
    glTexCoordPointer(2, GL_FLOAT, sizeof(Vertex), (GLvoid*)(sizeof(GLfloat)*6));

    // インデックスデータを設定
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, indices);

	// テクスチャを設定して、双線形補完を有効にする
	glEnable(GL_TEXTURE_2D);
	glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
	glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
	glBindTexture(GL_TEXTURE_2D, texture);

	// 球体を回転させる
	static GLfloat angle = 0.0f;
	angle += 1.0f;
	glRotatef(angle, 0.0f, 1.0f, 0.0f);

    // 球体を描画
    glDrawElements(GL_TRIANGLES, 3 * 32 * 8, GL_UNSIGNED_SHORT, 0);
}

// A class extension to declare private methods
@interface EAGLView ()

@property (nonatomic, retain) EAGLContext *context;
@property (nonatomic, assign) NSTimer *animationTimer;

- (BOOL) createFramebuffer;
- (void) destroyFramebuffer;

@end


@implementation EAGLView

@synthesize context;
@synthesize animationTimer;
@synthesize animationInterval;


// You must implement this method
+ (Class)layerClass {
    return [CAEAGLLayer class];
}


//The GL view is stored in the nib file. When it's unarchived it's sent -initWithCoder:
- (id)initWithCoder:(NSCoder*)coder {
    
    if ((self = [super initWithCoder:coder])) {
        // Get the layer
        CAEAGLLayer *eaglLayer = (CAEAGLLayer *)self.layer;
        
        eaglLayer.opaque = YES;
        eaglLayer.drawableProperties = [NSDictionary dictionaryWithObjectsAndKeys:
                                        [NSNumber numberWithBool:NO], kEAGLDrawablePropertyRetainedBacking, kEAGLColorFormatRGBA8, kEAGLDrawablePropertyColorFormat, nil];
        
        context = [[EAGLContext alloc] initWithAPI:kEAGLRenderingAPIOpenGLES1];
        
        if (!context || ![EAGLContext setCurrentContext:context]) {
            [self release];
            return nil;
        }
        
        animationInterval = 1.0 / 60.0;

		initializeGL(self.bounds);
    }
    return self;
}


- (void)drawView {
    [EAGLContext setCurrentContext:context];
    glBindFramebufferOES(GL_FRAMEBUFFER_OES, viewFramebuffer);
    drawScene();
    glBindRenderbufferOES(GL_RENDERBUFFER_OES, viewRenderbuffer);
    [context presentRenderbuffer:GL_RENDERBUFFER_OES];
}


- (void)layoutSubviews {
    [EAGLContext setCurrentContext:context];
    [self destroyFramebuffer];
    [self createFramebuffer];
    [self drawView];
}


- (BOOL)createFramebuffer {
    
    glGenFramebuffersOES(1, &viewFramebuffer);
    glGenRenderbuffersOES(1, &viewRenderbuffer);
    
    glBindFramebufferOES(GL_FRAMEBUFFER_OES, viewFramebuffer);
    glBindRenderbufferOES(GL_RENDERBUFFER_OES, viewRenderbuffer);
    [context renderbufferStorage:GL_RENDERBUFFER_OES fromDrawable:(CAEAGLLayer*)self.layer];
    glFramebufferRenderbufferOES(GL_FRAMEBUFFER_OES, GL_COLOR_ATTACHMENT0_OES, GL_RENDERBUFFER_OES, viewRenderbuffer);
    
    glGetRenderbufferParameterivOES(GL_RENDERBUFFER_OES, GL_RENDERBUFFER_WIDTH_OES, &backingWidth);
    glGetRenderbufferParameterivOES(GL_RENDERBUFFER_OES, GL_RENDERBUFFER_HEIGHT_OES, &backingHeight);
    
    if (USE_DEPTH_BUFFER) {
        glGenRenderbuffersOES(1, &depthRenderbuffer);
        glBindRenderbufferOES(GL_RENDERBUFFER_OES, depthRenderbuffer);
        glRenderbufferStorageOES(GL_RENDERBUFFER_OES, GL_DEPTH_COMPONENT16_OES, backingWidth, backingHeight);
        glFramebufferRenderbufferOES(GL_FRAMEBUFFER_OES, GL_DEPTH_ATTACHMENT_OES, GL_RENDERBUFFER_OES, depthRenderbuffer);
    }
    
    if(glCheckFramebufferStatusOES(GL_FRAMEBUFFER_OES) != GL_FRAMEBUFFER_COMPLETE_OES) {
        NSLog(@"failed to make complete framebuffer object %x", glCheckFramebufferStatusOES(GL_FRAMEBUFFER_OES));
        return NO;
    }
    
    return YES;
}


- (void)destroyFramebuffer {
    
    glDeleteFramebuffersOES(1, &viewFramebuffer);
    viewFramebuffer = 0;
    glDeleteRenderbuffersOES(1, &viewRenderbuffer);
    viewRenderbuffer = 0;
    
    if(depthRenderbuffer) {
        glDeleteRenderbuffersOES(1, &depthRenderbuffer);
        depthRenderbuffer = 0;
    }
}


- (void)startAnimation {
    self.animationTimer = [NSTimer scheduledTimerWithTimeInterval:animationInterval target:self selector:@selector(drawView) userInfo:nil repeats:YES];
}


- (void)stopAnimation {
    self.animationTimer = nil;
}


- (void)setAnimationTimer:(NSTimer *)newTimer {
    [animationTimer invalidate];
    animationTimer = newTimer;
}


- (void)setAnimationInterval:(NSTimeInterval)interval {
    
    animationInterval = interval;
    if (animationTimer) {
        [self stopAnimation];
        [self startAnimation];
    }
}


- (void)dealloc {
    
    [self stopAnimation];
    
    if ([EAGLContext currentContext] == context) {
        [EAGLContext setCurrentContext:nil];
    }
    
    [context release];  
    [super dealloc];
}

@end
