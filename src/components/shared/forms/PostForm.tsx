import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import FileUploader from "@/components/shared/FileUploader.tsx";
import {Input} from "@/components/ui/input.tsx";
import {PostValidation} from "@/lib/validation";
import {Models} from "appwrite";
import {useUserContext} from "@/context/AuthContext.tsx";
import {useToast} from "@/hooks/use-toast.ts";
import {useNavigate} from "react-router-dom";
import {useCreatePost, useUpdatePost} from "@/lib/react-query/queriesAndMutations.ts";

type PostFormPost = {
    post?: Models.Document,
    action: 'Create' | 'Update',
}

const PostForm = ({post, action}: PostFormPost) => {
    const {mutateAsync: createPost, isPending: isLoadingCreate} = useCreatePost();
    const {mutateAsync: updatePost, isPending: isLoadingUpdate} = useUpdatePost();
    const {user} = useUserContext();
    const {toast} = useToast();
    const navigate = useNavigate();

    const form = useForm<z.infer<typeof PostValidation>>({
        resolver: zodResolver(PostValidation),
        defaultValues: {
            caption: post ? post?.caption : "",
            file: [],
            location: post ? post?.location : "",
            tags: post ? post.tags.join(',') : '',
        },
    })

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof PostValidation>) {
        if(post && action === 'Update') {
            const updatedPost = await updatePost({
                ...values,
                postId: post.$id,
                imageId: post?.imageId,
                imageUrl: post?.imageUrl,
            })

            if(!updatedPost) {
                toast({title: 'Please try again'})
            }

            return navigate(`/posts/${post.$id}`)
        }

        const newPost = await createPost({
           ...values,
           userId: user.id,
        });

        if(!newPost) {
            toast({
                title: 'Please try again'
            });
        }

        navigate('/');
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-9 w-full max-w-5xl">
                <FormField
                    control={form.control}
                    name="caption"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel className="shad-form_label">Caption</FormLabel>
                            <FormControl>
                                <Textarea className="shad-textarea custom-scrollbar" {...field} />
                            </FormControl>
                            <FormMessage className="shad-form_message"/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="file"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel className="shad-form_label">Add Photos</FormLabel>
                            <FormControl>
                                <FileUploader
                                    fieldChange={field.onChange}
                                    mediaUrl={post?.imageUrl}
                                />
                            </FormControl>
                            <FormMessage className="shad-form_message"/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="location"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel className="shad-form_label">Add Location</FormLabel>
                            <FormControl>
                                <Input type="text" className="shad-input" {...field}/>
                            </FormControl>
                            <FormMessage className="shad-form_message"/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="tags"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel className="shad-form_label">Add Tags (separated by comma " , ")</FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    className="shad-input"
                                    placeholder="Art, Expression, Learn"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage className="shad-form_message"/>
                        </FormItem>
                    )}
                />
                <div className="flex gap-4 items-center justify-end">
                    <Button
                        type="button"
                        className="shad-button_dark_4"
                    >
                        Cancel
                    </Button>
                    <Button
                        className={`shad-button_primary whitespace-nowrap ${isLoadingUpdate || isLoadingCreate && 'pointer-events-none'}`}
                        type="submit"
                    >
                        {isLoadingCreate || isLoadingUpdate && 'Loading...'}
                        {action} Post
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default PostForm;
