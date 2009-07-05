//
//  iphone_glAppDelegate.m
//  iphone_gl
//
//  Created by 伊藤 千光 on 09/06/28.
//  Copyright __MyCompanyName__ 2009. All rights reserved.
//

#import "iphone_glAppDelegate.h"
#import "EAGLView.h"

@implementation iphone_glAppDelegate

@synthesize window;
@synthesize glView;

- (void)applicationDidFinishLaunching:(UIApplication *)application {
    
	glView.animationInterval = 1.0 / 60.0;
	[glView startAnimation];
}


- (void)applicationWillResignActive:(UIApplication *)application {
	glView.animationInterval = 1.0 / 5.0;
}


- (void)applicationDidBecomeActive:(UIApplication *)application {
	glView.animationInterval = 1.0 / 60.0;
}


- (void)dealloc {
	[window release];
	[glView release];
	[super dealloc];
}

@end
