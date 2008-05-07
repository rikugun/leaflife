package leaflife.widget.jsrpc;

import java.beans.PropertyDescriptor;
import java.lang.reflect.Method;
import java.util.Iterator;
import java.util.LinkedHashMap;

import net.sf.cglib.core.ReflectUtils;

public class MethodIntrospector
{
    // about 100 bytes per method object
    private static LinkedHashMap setter_cache = new LinkedHashMap(24, 0.75F, true);  // setter cache <Class.hashCode + setter name, Method>
    private static long max_setter_cache_size;  // the max size of setter cache
    private static LinkedHashMap getter_cache = new LinkedHashMap(16, 0.8F, true);  // getter cache <Class, PropertyDescriptor[]>
    private static long max_getter_cache_size;  // the max size of getter cache
    private static LinkedHashMap invoke_cache = new LinkedHashMap(28, 0.8F, true);  // invoke cache <Class.hashCode + setter name, Method>
    private static long max_invoke_cache_size;  // the max size of invoke cache
    static
    {
        long max_memory = Runtime.getRuntime().maxMemory();
        max_setter_cache_size = max_memory / 1000000;
        max_getter_cache_size = max_memory / 1600000;
        max_invoke_cache_size = max_memory / 1200000;
    }

    public static Method getWriteMethod(Object obj, String prop_name)
    {
        Class cls = obj.getClass();
        String cls_hash = String.valueOf(cls.hashCode());
        String key = new StringBuffer(cls_hash).append("set").append(String.valueOf(Character.toUpperCase(prop_name.charAt(0)))).append(prop_name.substring(1)).toString();  // Class.hashCode + setter name
        synchronized (setter_cache)
        {
            Method result = (Method) setter_cache.get(key);
            if (result == null && ! setter_cache.containsKey(key))
            {
                int cache_size = setter_cache.size();
                PropertyDescriptor[] prop_descs = ReflectUtils.getBeanSetters(cls);
                for (int i = 0; i < prop_descs.length; ++ i)
                {
                    PropertyDescriptor prop_desc = prop_descs[i];
                    Method method = prop_desc.getWriteMethod();
                    // remove the least-recently accessed setter if reach the max cache size
                    if (cache_size == max_setter_cache_size)
                    {
                        Iterator j = setter_cache.entrySet().iterator();
                        if (j.hasNext())
                        {
                            j.next();
                            j.remove();
                        }
                    }
                    // put the setters into cache
                    setter_cache.put(new StringBuffer(cls_hash).append(method.getName()).toString(), method);
                }
                result = (Method) setter_cache.get(key);
                // set null value if method not found
                if (result == null)
                {
                    setter_cache.put(key, null);
                }
            }
            return result;
        }
    }

    public static PropertyDescriptor[] getReadMethods(Object obj)
    {
        Class cls = obj.getClass();
        synchronized (getter_cache)  // <Class, PropertyDescriptor[]>
        {
            // find getters in cache
            PropertyDescriptor[] result = (PropertyDescriptor[]) getter_cache.get(cls);
            if (result == null)  // introspect getters
            {
                result = ReflectUtils.getBeanGetters(cls);
                // remove the least-recently accessed getter if reach the max cache size
                if (getter_cache.size() == max_getter_cache_size)
                {
                    Iterator i = getter_cache.entrySet().iterator();
                    if (i.hasNext())
                    {
                        i.next();
                        i.remove();
                    }
                }
                // put the getters into cache
                getter_cache.put(cls, result);
            }
            return result;
        }
    }

    public static Method getInvokeMethod(Class cls, String method_name)
    {
        String cls_hash = String.valueOf(cls.hashCode());
        String key = new StringBuffer(cls_hash).append(method_name).toString();  // Class.hashCode + setter name
        synchronized (invoke_cache)
        {
            Method result = (Method) invoke_cache.get(key);
            if (result == null)
            {
                int cache_size = invoke_cache.size();
                Class obj_cls = Object.class;
                Method[] method_list = cls.getMethods();
                for (int i = 0; i < method_list.length; ++ i)
                {
                    Method method = method_list[i];
                    // exclude Object method
                    if (method.getDeclaringClass() != obj_cls)
                    {
                        // remove the least-recently accessed method if reach the max cache size
                        if (cache_size == max_invoke_cache_size)
                        {
                            Iterator j = invoke_cache.entrySet().iterator();
                            if (j.hasNext())
                            {
                                j.next();
                                j.remove();
                            }
                        }
                        // put the method into the cache
                        invoke_cache.put(new StringBuffer(cls_hash).append(method.getName()).toString(), method);
                    }
                }
                result = (Method) invoke_cache.get(key);
            }
            return result;
        }
    }
}
