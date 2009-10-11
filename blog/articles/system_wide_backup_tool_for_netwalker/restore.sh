#! /bin/bash

if [ -z $1 ]; then
	echo "usage: backup.sh dir"
	exit 1
fi

if ! [ -d $1 ]; then
	echo "$BACKUP_DIR is not exist or not a directory."
	exit 2
fi

SRC_DIR=/mnt/root
BACKUP_DIR=`dirname $1/a`
KERNEL_DEV=/dev/mtd3
KERNEL_IMG=$BACKUP_DIR/kernel.bin
RSYNC_CMD=rsync
RSYNC_OPTS="-aAX --delete --force --numeric-ids --progress"

$RSYNC_CMD $RSYNC_OPTS $BACKUP_DIR/root/ $SRC_DIR

flash_eraseall $KERNEL_DEV
nandwrite -p $KERNEL_DEV $KERNEL_IMG
nandverify -o -b $KERNEL_DEV -f $KERNEL_IMG
