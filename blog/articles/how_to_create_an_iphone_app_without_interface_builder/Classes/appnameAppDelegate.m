//
//  appnameAppDelegate.m
//  appname
//
//  Created by 伊藤 千光 on 10/02/10.
//  Copyright __MyCompanyName__ 2010. All rights reserved.
//

#import "appnameAppDelegate.h"
#import "MyTableViewController.h"

@implementation appnameAppDelegate

- (void)applicationDidFinishLaunching:(UIApplication *)application {
    window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
    viewController = [[MyTableViewController alloc] init];
    navigationController = [[UINavigationController alloc]
                               initWithRootViewController:viewController];
    [window addSubview:navigationController.view];
    [window makeKeyAndVisible];
}

- (void)dealloc {
    [viewController release];
    [navigationController release];
    [window release];
    [super dealloc];
}

@end
