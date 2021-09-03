import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

import { Post } from '../post.model'
import { PostService } from '../post.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
posts:Post[] = [];
userIsAuthenticated = false;
private authStatusSub: Subscription;
private PostSub: Subscription;
userId: string;
isLoading = false;
currentPage = 1;
totalPosts = 0;
postPerPage = 5;
pageSizeOptions = [1,2,5,10]


  constructor(public postService:PostService,
    private authService: AuthService) { }

  ngOnInit() {
    this.isLoading = true;
    this.userId = this.authService.getUserId();
    this.postService.getPosts(this.postPerPage, this.currentPage);
    this.PostSub =  this.postService.getPostUpdateListener()
    .subscribe((postData: {posts: Post[], postCount: number}) => {
      this.isLoading = false;
      this.userId = this.authService.getUserId();
      this.posts = postData.posts;
      this.totalPosts = postData.postCount;
    });
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub =  this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
    })
  }

  onChangePage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postPerPage = pageData.pageSize;
    this.postService.getPosts(this.postPerPage, this.currentPage);
  }

  onDelete(postId: string) {
    this.isLoading = true;
    this.postService.deletePost(postId).subscribe(() => {
      this.postService.getPosts(this.postPerPage, this.currentPage)
      // gets directly from the getPosts
    }), () => {
      this.isLoading = false;
    }
  }
  ngOnDestroy() {
    this.PostSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }




}
