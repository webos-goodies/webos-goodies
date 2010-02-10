#import <UIKit/UIKit.h>

@interface MyTableViewController : UITableViewController {
    NSMutableArray* items;  // 表示アイテムの配列
    int             nextID; // 次に作成するアイテム番号
}

- (void)addItem;
- (void)startEditing;
- (void)finishEditing;

@end
