//
//  appnameAppDelegate.h
//  appname
//
//  Created by 伊藤 千光 on 10/02/10.
//  Copyright __MyCompanyName__ 2010. All rights reserved.
//

#import <UIKit/UIKit.h>

@class MyTableViewController;

@interface appnameAppDelegate : NSObject <UIApplicationDelegate> {
    UIWindow*               window;
    UINavigationController* navigationController;
    MyTableViewController*  viewController;
}

@end
