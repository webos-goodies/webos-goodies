#import "MyTableViewController.h"

@implementation MyTableViewController

// 作成時に呼ばれる
- (id)init
{
    self   = [super init];
    items  = [[NSMutableArray alloc] init];
    nextID = 1;

    // ナビゲーションバーに表示するタイトル
    self.title = @"Template";

    // ナビゲーションバー左のボタン
    self.navigationItem.leftBarButtonItem =
        [[[UIBarButtonItem alloc]
             initWithBarButtonSystemItem: UIBarButtonSystemItemAdd
             target: self action: @selector(addItem)] autorelease];

    // ナビゲーションバー右のボタン
    self.navigationItem.rightBarButtonItem =
        [[[UIBarButtonItem alloc]
             initWithBarButtonSystemItem: UIBarButtonSystemItemEdit
             target: self action: @selector(startEditing)] autorelease];

    return self;
}

// 削除時に呼ばれる
- (void)dealloc
{
    [items release];
    [super dealloc];
}

// デバイスの回転に対応するかどうか
- (BOOL)shouldAutorotateToInterfaceOrientation:
    (UIInterfaceOrientation)interfaceOrientation
{
    return YES;
}

// テーブルビューのセクションの数
- (NSInteger)numberOfSectionsInTableView:(UITableView*)tableView
{
    return 1;
}

// セクションの行数
- (NSInteger)tableView:(UITableView*)tableView
 numberOfRowsInSection:(NSInteger)section
{
    return [items count];
}

// 各行の表示内容を返す
- (UITableViewCell*)tableView:(UITableView*)tableView
        cellForRowAtIndexPath:(NSIndexPath*)indexPath
{
    NSString*  identifier = [items objectAtIndex:[indexPath indexAtPosition:1]];
    UITableViewCell* cell = [tableView dequeueReusableCellWithIdentifier: identifier];
    if(!cell) {
        cell = [[[UITableViewCell alloc]
                    initWithStyle: UITableViewCellStyleDefault
                    reuseIdentifier: identifier] autorelease];
        cell.textLabel.text = identifier;
    }
    return cell;
}

// 行がタッチされたときに呼ばれる
- (void)tableView:(UITableView*)tableView didSelectRowAtIndexPath:(NSIndexPath*)indexPath
{
    [tableView deselectRowAtIndexPath:indexPath animated:YES];
    NSString*     item = [items objectAtIndex:[indexPath indexAtPosition:1]];
    UIAlertView* alert = [[UIAlertView alloc] initWithTitle: @"選択"
                                              message: item
                                              delegate: nil
                                              cancelButtonTitle: nil
                                              otherButtonTitles: @"OK", nil];
    [alert show];
    [alert release];
}

// 行が編集されたときに呼ばれる
- (void)tableView   :(UITableView*)tableView
  commitEditingStyle:(UITableViewCellEditingStyle)editingStyle
   forRowAtIndexPath:(NSIndexPath*)indexPath
{
    if(editingStyle == UITableViewCellEditingStyleDelete)
    {
        [items removeObjectAtIndex:[indexPath indexAtPosition:1]];
        [self.tableView
             deleteRowsAtIndexPaths:[NSArray arrayWithObject:indexPath]
             withRowAnimation:UITableViewRowAnimationTop];
    }
}

// ナビゲーションバー左のボタンがタッチされたときに呼ばれる
- (void)addItem
{
    [items addObject: [NSString stringWithFormat: @"item%d", nextID++]];
    [self.tableView reloadData];
}

// ナビゲーションバー右のボタンがタッチされたときに呼ばれる
- (void)startEditing
{
    [self.tableView setEditing:YES animated:YES];
    self.navigationItem.rightBarButtonItem =
        [[[UIBarButtonItem alloc]
             initWithBarButtonSystemItem: UIBarButtonSystemItemDone
             target: self action: @selector(finishEditing)] autorelease];
}

// 編集中にナビゲーションバー右のボタンがタッチされたときに呼ばれる
- (void)finishEditing
{
    [self.tableView setEditing:NO animated:YES];
    self.navigationItem.rightBarButtonItem =
        [[[UIBarButtonItem alloc]
             initWithBarButtonSystemItem: UIBarButtonSystemItemEdit
             target: self action: @selector(startEditing)] autorelease];
}

@end
